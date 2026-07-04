namespace RevArt.Core.Entities;

public class PageSection
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;


    public string PageName { get; set; } = string.Empty;


    public string SectionKey { get; set; } = string.Empty;


    public string? Heading { get; set; }


    public string? Body { get; set; }


    public string? ImageUrl { get; set; }


    public int SortOrder { get; set; }


    public bool IsActive { get; set; } = true;


    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    public DateTime? UpdatedAt { get; set; }
}