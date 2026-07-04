using RevArt.Core.Enums;

namespace RevArt.Core.Entities;

public class Vehicle
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int ManufacturerId { get; set; }
    public Manufacturer Manufacturer { get; set; } = null!;

    public int VehicleTypeId { get; set; }
    public VehicleType VehicleType { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public int Year { get; set; }
   
    public string Model { get; set; } = string.Empty;
    public string? Trim { get; set; }

    public string? VIN { get; set; }
    public int? Mileage { get; set; }

    public string? Transmission { get; set; }
    public string? ExteriorColor { get; set; }
    public string? InteriorColor { get; set; }

    public decimal? Price { get; set; }
    public VehicleStatus Status { get; set; } = VehicleStatus.Draft;

    public bool IsFeatured { get; set; }
    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<VehiclePhoto> Photos { get; set; } = new List<VehiclePhoto>();
    public ICollection<VehicleDocument> Documents { get; set; } = new List<VehicleDocument>();

    public string? HeroTagline { get; set; }

    public string? OverviewText { get; set; }

    public string? HistoryText { get; set; }

    public string? TheCarText { get; set; }

    public string? MarketNotes { get; set; }
    
    public string? ConditionReportText { get; set; }
}