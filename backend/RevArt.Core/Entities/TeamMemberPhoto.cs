namespace RevArt.Core.Entities;

public class TeamMemberPhoto
{
    public int Id { get; set; }

    public int TeamMemberId { get; set; }
    public TeamMember? TeamMember { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsCover { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
