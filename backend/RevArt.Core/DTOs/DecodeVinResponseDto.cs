namespace RevArt.Core.DTOs;

public class DecodeVinResponseDto
{
    public bool Success { get; set; }

    public string Vin { get; set; } = string.Empty;

    public int? Year { get; set; }

    public string? ManufacturerName { get; set; }

    public int? ManufacturerId { get; set; }

    public string? Model { get; set; }

    public string? Trim { get; set; }

    public string? VehicleTypeName { get; set; }

    public int? VehicleTypeId { get; set; }

    public string? Transmission { get; set; }

    public string? ErrorMessage { get; set; }

    public List<string> Warnings { get; set; } = new();
}
