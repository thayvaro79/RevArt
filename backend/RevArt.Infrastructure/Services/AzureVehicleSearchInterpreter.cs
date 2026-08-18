#pragma warning disable OPENAI001

using OpenAI.Responses;
using RevArt.Core.DTOs;
using RevArt.Core.Interfaces;
using System.ClientModel;
using System.Text.Json;

namespace RevArt.Infrastructure.Services;

public class AzureVehicleSearchInterpreter : IVehicleSearchInterpreter
{
    private readonly ResponsesClient _responsesClient;
    private readonly string _deploymentName;

    public AzureVehicleSearchInterpreter(
        string endpoint,
        string apiKey,
        string deploymentName)
    {
        _deploymentName = deploymentName;

        _responsesClient = new ResponsesClient(
            credential: new ApiKeyCredential(apiKey),
            options: new ResponsesClientOptions
            {
                Endpoint = new Uri(endpoint)
            });
    }

    public async Task<VehicleSearchIntent> InterpretAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        var prompt =
            $"""
            You interpret natural-language vehicle inventory searches.

            Extract only the search criteria explicitly stated or clearly implied.

            Return JSON only with these possible fields:
            manufacturer,
            vehicleType,
            model,
            trim,
            minYear,
            maxYear,
            minMileage,
            maxMileage,
            minPrice,
            maxPrice,
            transmission,
            exteriorColor,
            interiorColor,
            isFeatured.

            Use null for criteria that are not specified.
            Do not invent values.

            User query:
            {query}
            """;

        var options = new CreateResponseOptions
        {
            Model = _deploymentName
        };

        options.InputItems.Add(
            ResponseItem.CreateUserMessageItem(prompt));

        ResponseResult response =
            await _responsesClient.CreateResponseAsync(
                options,
                cancellationToken);

        var json = response.GetOutputText().Trim();

        // Some models may wrap JSON in a Markdown code fence:
        // ```json
        // { ... }
        // ```
        // Strip the fence before deserializing.
        if (json.StartsWith("```"))
        {
            var firstNewLine = json.IndexOf('\n');

            if (firstNewLine >= 0)
            {
                json = json[(firstNewLine + 1)..];
            }

            if (json.EndsWith("```"))
            {
                json = json[..^3];
            }

            json = json.Trim();
        }

        var intent = JsonSerializer.Deserialize<VehicleSearchIntent>(
            json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        return intent ?? new VehicleSearchIntent();
    }
}

#pragma warning restore OPENAI001