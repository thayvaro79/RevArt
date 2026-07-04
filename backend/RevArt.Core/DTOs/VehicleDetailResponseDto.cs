namespace RevArt.Core.DTOs;
public class VehicleDetailResponseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Manufacturer { get; set; }

    public string Model { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public decimal? Price { get; set; }

    public int Year { get; set; }

    public int? Mileage { get; set; }

    public string? Vin { get; set; }

    public string? Transmission { get; set; }

    public string? ExteriorColor { get; set; }

    public string? InteriorColor { get; set; }

    public string? HeroTagline { get; set; }

    public string? OverviewText { get; set; }

    public string? HistoryText { get; set; }

    public string? TheCarText { get; set; }

    public string? MarketNotes { get; set; }

    public string? ConditionReportText { get; set; }

    public List<VehiclePhotoResponseDto> Photos { get; set; } = new();
}