#pragma warning disable OPENAI001

using OpenAI.Responses;
using RevArt.Core.DTOs;
using RevArt.Core.Interfaces;
using System.ClientModel;
using System.Text;

namespace RevArt.Infrastructure.Services;

public class AzureVehicleEditorialDraftService : IVehicleEditorialDraftService
{
    private readonly ResponsesClient _responsesClient;
    private readonly string _deploymentName;

    public AzureVehicleEditorialDraftService(
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

    public async Task<string> GenerateDraftAsync(
        VehicleEditorialDraftRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var prompt = request.Intent == EditorialDraftIntent.History
            ? BuildHistoryPrompt(request)
            : BuildTheCarPrompt(request);

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

        return response.GetOutputText().Trim();
    }

    private static string BuildVehicleFacts(VehicleEditorialDraftRequestDto request)
    {
        var facts = new StringBuilder();

        void AddFact(string label, string? value)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                facts.AppendLine($"{label}: {value}");
            }
        }

        AddFact("Year", request.Year?.ToString());
        AddFact("Manufacturer", request.ManufacturerName);
        AddFact("Model", request.Model);
        AddFact("Trim", request.Trim);
        AddFact("Mileage", request.Mileage?.ToString());
        AddFact("Transmission", request.Transmission);
        AddFact("Exterior color", request.ExteriorColor);
        AddFact("Interior color", request.InteriorColor);
        AddFact("VIN", request.Vin);

        return facts.ToString();
    }

    private static string BuildHistoryPrompt(VehicleEditorialDraftRequestDto request)
    {
        return
            $"""
            You are an automotive editorial writer for a collector-car dealership.

            Write a "History" section for this vehicle's listing page: model
            introduction, historical significance, production context, engineering
            background, notable variants, and collector relevance for this
            make/model/generation in general.

            Known facts about this specific vehicle:
            {BuildVehicleFacts(request)}

            Rules:
            - Write only about the model/variant in general, not this specific example.
            - Do not invent this specific vehicle's ownership history.
            - Do not state exact production numbers unless they are extremely well
              established, widely known facts about the model.
            - Do not invent awards, provenance, service records, accident history, or
              rarity claims.
            - If you are not confident about a specific fact, write about the model
              in more general, restrained terms instead of guessing.
            - Write 2-4 short paragraphs of polished, editorial prose. No headings,
              no bullet points, no markdown.
            """;
    }

    private static string BuildTheCarPrompt(VehicleEditorialDraftRequestDto request)
    {
        return
            $"""
            You are an automotive editorial writer for a collector-car dealership.

            Write "The Car" section for this vehicle's listing page: a description
            of this specific example being offered for sale, covering its
            configuration, specification, and notable equipment based only on the
            facts given below.

            Known facts about this specific vehicle:
            {BuildVehicleFacts(request)}

            Rules:
            - Only describe facts explicitly provided above.
            - Do not invent number of owners, maintenance/service history, concours
              awards, originality claims, accident-free claims, matching-numbers
              claims, or undocumented options.
            - Do not invent ownership or provenance details.
            - If the known facts are sparse, write a short, restrained description
              rather than fabricating detail.
            - Write 2-3 short paragraphs of polished, editorial prose. No headings,
              no bullet points, no markdown.
            """;
    }
}

#pragma warning restore OPENAI001
