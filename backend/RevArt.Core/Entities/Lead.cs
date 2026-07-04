using RevArt.Core.Enums;

namespace RevArt.Core.Entities;

public class Lead
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public LeadType LeadType { get; set; } = LeadType.General;

    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }

    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }

    public string? Message { get; set; }
    public decimal? OfferAmount { get; set; }

    public bool IsClosed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}