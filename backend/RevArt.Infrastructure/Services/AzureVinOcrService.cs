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

        const string promptText =
            """
            You are examining a photo that may or may not show a vehicle
            identification number (VIN) plate, sticker, or door-jamb label. A real
            VIN is exactly 17 characters using only digits 0-9 and uppercase
            letters A-Z, and never contains the letters I, O, or Q.

            Look carefully. Only report a VIN if you can actually see printed or
            embossed alphanumeric characters in the image that form one. The image
            may be blank, blurry, unrelated, or simply not show a VIN — in any of
            those cases, or if you have any real doubt, you must say so rather than
            guessing or reconstructing a plausible-looking VIN.

            Respond with ONLY a JSON object (no markdown, no other text) in exactly
            this shape:
            {"vinVisible": true or false, "vin": "the characters you actually read, or null"}
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

        ResponseResult response = await _responsesClient.CreateResponseAsync(options, cancellationToken);

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

        const string cantReadMessage =
            "Couldn't read a VIN from that photo. Try again with better lighting/focus, or type it manually.";

        if (parsed is null || !parsed.VinVisible || string.IsNullOrWhiteSpace(parsed.Vin))
        {
            return new VinOcrResult { Success = false, ErrorMessage = cantReadMessage };
        }

        // Strip anything OCR-style output might add (spaces, dashes, punctuation)
        // before checking it actually forms a well-shaped VIN, even though the
        // model reported it saw one — this is a real physical-world detail we can
        // verify independently of the model's own judgment.
        var cleaned = Regex.Replace(parsed.Vin.ToUpperInvariant(), "[^A-Z0-9]", "");
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
        [JsonPropertyName("vinVisible")]
        public bool VinVisible { get; set; }

        [JsonPropertyName("vin")]
        public string? Vin { get; set; }
    }
}

#pragma warning restore OPENAI001
