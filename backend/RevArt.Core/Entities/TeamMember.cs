namespace RevArt.Core.Entities;

public class TeamMember
{
    public int Id { get; set; }

    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;


    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;


    public string? Title { get; set; }


    public string? Bio { get; set; }


    public string? PhotoUrl { get; set; }


    public int SortOrder { get; set; }


    public bool IsActive { get; set; } = true;


    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TeamMemberPhoto> Photos { get; set; } = new List<TeamMemberPhoto>();

    public ApplicationUser? User { get; set; }
}