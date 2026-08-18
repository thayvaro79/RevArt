namespace RevArt.Core.DTOs;

public class VehicleSearchIntent
{
    public string? Manufacturer { get; set; }

    public string? VehicleType { get; set; }

    public string? Model { get; set; }

    public string? Trim { get; set; }

    public int? MinYear { get; set; }

    public int? MaxYear { get; set; }

    public int? MinMileage { get; set; }

    public int? MaxMileage { get; set; }

    public decimal? MinPrice { get; set; }

    public decimal? MaxPrice { get; set; }

    public string? Transmission { get; set; }

    public string? ExteriorColor { get; set; }

    public string? InteriorColor { get; set; }

    public bool? IsFeatured { get; set; }
}