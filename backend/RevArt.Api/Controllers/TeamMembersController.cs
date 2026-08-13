using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamMembersController : ControllerBase
{
    private readonly RevArtDbContext _db;

    public TeamMembersController(RevArtDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamMemberSummaryResponse>>> GetTeamMembers(
        [FromQuery] int tenantId = 1)
    {
        var members = await _db.TeamMembers
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId)
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        var memberIds = members.Select(t => t.Id).ToList();

        var photos = await _db.TeamMemberPhotos
            .AsNoTracking()
            .Where(p => memberIds.Contains(p.TeamMemberId) && p.IsActive)
            .ToListAsync();

        var response = members.Select(t => new TeamMemberSummaryResponse
        {
            Id = t.Id,
            Slug = t.Slug,
            Name = t.Name,
            Title = t.Title,
            CoverImageUrl = ResolveCoverImageUrl(t.Id, t.PhotoUrl, photos)
        }).ToList();

        return Ok(response);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<TeamMemberDetailResponse>> GetTeamMember(
        string slug,
        [FromQuery] int tenantId = 1)
    {
        var member = await _db.TeamMembers
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId)
            .Where(t => t.Slug == slug)
            .Where(t => t.IsActive)
            .FirstOrDefaultAsync();

        if (member is null)
        {
            return NotFound();
        }

        var photos = await _db.TeamMemberPhotos
            .AsNoTracking()
            .Where(p => p.TeamMemberId == member.Id && p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new TeamMemberPhotoResponse
            {
                Id = p.Id,
                ImageUrl = p.ImageUrl,
                SortOrder = p.SortOrder,
                IsCover = p.IsCover
            })
            .ToListAsync();

        return Ok(new TeamMemberDetailResponse
        {
            Id = member.Id,
            Slug = member.Slug,
            Name = member.Name,
            Title = member.Title,
            Bio = member.Bio,
            Photos = photos
        });
    }

    private static string? ResolveCoverImageUrl(
        int teamMemberId,
        string? legacyPhotoUrl,
        List<TeamMemberPhoto> photos)
    {
        var memberPhotos = photos.Where(p => p.TeamMemberId == teamMemberId).ToList();

        return memberPhotos.Where(p => p.IsCover).Select(p => p.ImageUrl).FirstOrDefault()
            ?? memberPhotos.OrderBy(p => p.SortOrder).Select(p => p.ImageUrl).FirstOrDefault()
            ?? legacyPhotoUrl;
    }
}

public class TeamMemberSummaryResponse
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? CoverImageUrl { get; set; }
}

public class TeamMemberDetailResponse
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public List<TeamMemberPhotoResponse> Photos { get; set; } = new();
}

public class TeamMemberPhotoResponse
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }
}
