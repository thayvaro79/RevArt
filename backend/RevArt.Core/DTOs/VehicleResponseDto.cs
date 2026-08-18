namespace RevArt.Core.DTOs;

public class VehicleResponseDto
{
    public int Id { get; set; }

    public string VehicleTypeName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public int Year { get; set; }

    public string ManufacturerName { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public string? Trim { get; set; }

    public int? Mileage { get; set; }

    public decimal? Price { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool IsFeatured { get; set; }

    public string? ExteriorColor { get; set; }

    public string? InteriorColor { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }
}