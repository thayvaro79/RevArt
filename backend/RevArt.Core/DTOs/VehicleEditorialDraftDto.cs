using System.Text.Json.Serialization;

namespace RevArt.Core.DTOs;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EditorialDraftIntent
{
    History,
    TheCar
}

public class VehicleEditorialDraftRequestDto
{
    public EditorialDraftIntent Intent { get; set; }

    public string? ManufacturerName { get; set; }
    public string? Model { get; set; }
    public string? Trim { get; set; }
    public int? Year { get; set; }
    public int? Mileage { get; set; }
    public string? Transmission { get; set; }
    public string? ExteriorColor { get; set; }
    public string? InteriorColor { get; set; }
    public string? Vin { get; set; }
}

public class VehicleEditorialDraftResponseDto
{
    public string Draft { get; set; } = string.Empty;
}
