namespace RevArt.Core.Entities;

public class Location
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;


    public string Name { get; set; } = string.Empty;


    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }


    public string? City { get; set; }

    public string? State { get; set; }

    public string? PostalCode { get; set; }

    public string? Country { get; set; }


    public string? Phone { get; set; }

    public string? Email { get; set; }


    public bool IsPrimary { get; set; }


    public bool IsActive { get; set; } = true;
}