using Microsoft.AspNetCore.Identity;

namespace RevArt.Core.Entities;

public class ApplicationUser : IdentityUser<int>
{
    public int TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public int? TeamMemberId { get; set; }
    public TeamMember? TeamMember { get; set; }

    public string? DisplayName { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
