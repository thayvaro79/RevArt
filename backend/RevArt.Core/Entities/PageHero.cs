namespace RevArt.Core.Entities;

public class PageHero
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string PageKey { get; set; } = string.Empty; // garage, home, contact

    public string PageName { get; set; } = string.Empty; // Garage, Home

    public string HeroType { get; set; } = string.Empty; // Landing, Inventory, Contact

    public string? EyebrowText { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Subtitle { get; set; }

    public string? ButtonText { get; set; }

    public string? ButtonUrl { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}