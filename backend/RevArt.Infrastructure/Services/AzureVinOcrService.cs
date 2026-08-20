#pragma warning disable OPENAI001

using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using OpenAI.Responses;
using RevArt.Core.Interfaces;
using RevArt.Core.Models;
using System.ClientModel;

namespace RevArt.Infrastructure.Services;

/// <summary>
/// Reads a VIN out of a photo using the same Azure OpenAI resource/deployment
/// already deployed for AI Search (RevArt has no separate Vision/OCR resource,
/// and this deployment is multimodal, so no new Azure resource or config is
/// needed).
/// </summary>
public class AzureVinOcrService : IVinOcrService
{
    // Same character set as the rest of RevArt's VIN handling: VINs never
    // contain I, O, or Q.
    private static readonly Regex VinPattern = new("[A-HJ-NPR-Z0-9]{17}", RegexOptions.Compiled);

    private readonly ResponsesClient _responsesClient;
    private readonly string _deploymentName;

    public AzureVinOcrService(string endpoint, string apiKey, string deploymentName)
    {
        _deploymentName = deploymentName;

        _responsesClient = new ResponsesClient(
            credential: new ApiKeyCredential(apiKey),
            options: new ResponsesClientOptions
            {
                Endpoint = new Uri(endpoint)
            });
    }

    public async Task<VinOcrResult> ExtractVinAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        using var memoryStream = new MemoryStream();
        await imageStream.CopyToAsync(memoryStream, cancellationToken);

        var mediaType = string.IsNullOrWhiteSpace(contentType) ? "image/jpeg" : contentType;
        var imageBytes = BinaryData.FromBytes(memoryStream.ToArray(), mediaType);

        // Deliberately does NOT ask the model to judge length/format (e.g. "is
        // this 17 characters") — vision models are unreliable at precisely
        // counting characters as part of a compound reasoning step, and will
        // reject a VIN they transcribed correctly because they miscounted it.
        // The model's only job is to transcribe what it sees; the 17-character,
        // no-I/O/Q validation below is the sole authority on format.
        const string promptText =
            """
            You are examining a photo that may or may not show a vehicle
            identification number (VIN) plate, sticker, or door-jamb label.

            Look carefully at the image. If you can see printed or embossed
            alphanumeric characters that look like a VIN (a long code mixing
            letters and digits), report exactly the characters you see, as
            literally as possible — do not count them, do not pad or trim them,
            and do not decide whether the length or format is correct; another
            system will validate that separately. If the image is blank, blurry,
            unrelated, or you do not see any such code at all, say so instead of
            guessing.

            Respond with ONLY a JSON object (no markdown, no other text) in exactly
            this shape:
            {"textVisible": true or false, "text": "the exact characters you read, or null"}
            """;

        var options = new CreateResponseOptions
        {
            Model = _deploymentName
        };

        options.InputItems.Add(ResponseItem.CreateUserMessageItem(new[]
        {
            ResponseContentPart.CreateInputTextPart(promptText),
            ResponseContentPart.CreateInputImagePart(imageBytes)
        }));

        const string cantReadMessage =
            "Couldn't read a VIN from that photo. Try again with better lighting/focus, or type it manually.";

        ResponseResult response;
        try
        {
            response = await _responsesClient.CreateResponseAsync(options, cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // The vision service rejected the request outright (e.g. an
            // unreadable/corrupt image, or a transient service error) — this is
            // a normal, expected outcome for a bad photo, not a server bug.
            return new VinOcrResult { Success = false, ErrorMessage = cantReadMessage };
        }

        var raw = (response.GetOutputText() ?? string.Empty).Trim();
        var json = StripCodeFence(raw);

        VinVisionResponse? parsed;
        try
        {
            parsed = JsonSerializer.Deserialize<VinVisionResponse>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException)
        {
            parsed = null;
        }

        if (parsed is null || !parsed.TextVisible || string.IsNullOrWhiteSpace(parsed.Text))
        {
            return new VinOcrResult { Success = false, ErrorMessage = cantReadMessage };
        }

        // Strip anything OCR-style output might add (spaces, dashes, punctuation),
        // then find a contiguous 17-character VIN-shaped candidate within it. This
        // regex — not the model — is the sole authority on length/format.
        var cleaned = Regex.Replace(parsed.Text.ToUpperInvariant(), "[^A-Z0-9]", "");
        var match = VinPattern.Match(cleaned);

        if (!match.Success)
        {
            return new VinOcrResult { Success = false, ErrorMessage = cantReadMessage };
        }

        return new VinOcrResult
        {
            Success = true,
            Vin = match.Value
        };
    }

    private static string StripCodeFence(string text)
    {
        if (!text.StartsWith("```"))
        {
            return text;
        }

        var firstNewLine = text.IndexOf('\n');

        if (firstNewLine >= 0)
        {
            text = text[(firstNewLine + 1)..];
        }

        if (text.EndsWith("```"))
        {
            text = text[..^3];
        }

        return text.Trim();
    }

    private class VinVisionResponse
    {
        [JsonPropertyName("textVisible")]
        public bool TextVisible { get; set; }

        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}

#pragma warning restore OPENAI001
