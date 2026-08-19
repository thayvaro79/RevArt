using System.Net.Http.Json;
using System.Text.Json.Serialization;
using RevArt.Core.Interfaces;
using RevArt.Core.Models;

namespace RevArt.Infrastructure.Services;

public class NhtsaVinDecoderService : IVinDecoderService
{
    private readonly HttpClient _httpClient;

    public NhtsaVinDecoderService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<VinDecodeResult> DecodeAsync(string vin, CancellationToken cancellationToken = default)
    {
        NhtsaDecodeVinValuesResponse? payload;

        try
        {
            payload = await FetchWithRetryAsync(vin, cancellationToken);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or NotSupportedException)
        {
            return new VinDecodeResult
            {
                Success = false,
                ErrorMessage = "Couldn't reach the VIN decoding service. Try again or enter details manually."
            };
        }

        var record = payload?.Results?.FirstOrDefault();

        if (record is null)
        {
            return new VinDecodeResult
            {
                Success = false,
                ErrorMessage = "The VIN decoding service returned no data for this VIN."
            };
        }

        var make = GetValue(record, "Make");
        var model = GetValue(record, "Model");
        var trim = GetValue(record, "Trim") ?? GetValue(record, "Series");
        var bodyClass = GetValue(record, "BodyClass");
        var transmission = GetValue(record, "TransmissionStyle");
        var modelYearText = GetValue(record, "ModelYear");
        var errorCode = GetValue(record, "ErrorCode");
        var errorText = GetValue(record, "ErrorText");

        int? year = int.TryParse(modelYearText, out var parsedYear) ? parsedYear : null;

        var hasUsableData = !string.IsNullOrWhiteSpace(make) || !string.IsNullOrWhiteSpace(model);

        if (!hasUsableData)
        {
            return new VinDecodeResult
            {
                Success = false,
                ErrorMessage = !string.IsNullOrWhiteSpace(errorText) && errorCode != "0"
                    ? errorText
                    : "This VIN couldn't be decoded. Enter the vehicle details manually."
            };
        }

        return new VinDecodeResult
        {
            Success = true,
            Year = year,
            Make = make,
            Model = model,
            Trim = trim,
            BodyClass = bodyClass,
            Transmission = transmission
        };
    }

    private async Task<NhtsaDecodeVinValuesResponse?> FetchWithRetryAsync(string vin, CancellationToken cancellationToken)
    {
        const int maxAttempts = 2;
        var requestUri = $"DecodeVinValues/{Uri.EscapeDataString(vin)}?format=json";

        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<NhtsaDecodeVinValuesResponse>(requestUri, cancellationToken);
            }
            catch (Exception ex) when (attempt < maxAttempts && ex is HttpRequestException or TaskCanceledException)
            {
                // vPIC is a free public NHTSA API and occasionally has transient
                // hiccups — one retry avoids surfacing those as a hard failure.
                await Task.Delay(500, cancellationToken);
            }
        }
    }

    private static string? GetValue(Dictionary<string, string?> record, string key)
    {
        if (!record.TryGetValue(key, out var value))
        {
            return null;
        }

        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private class NhtsaDecodeVinValuesResponse
    {
        [JsonPropertyName("Results")]
        public List<Dictionary<string, string?>>? Results { get; set; }
    }
}
