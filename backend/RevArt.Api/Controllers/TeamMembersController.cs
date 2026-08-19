using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
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

    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<IEnumerable<TeamMemberAdminResponse>>> GetTeamMembersAdmin(
        [FromQuery] int tenantId = 1)
    {
        var members = await _db.TeamMembers
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.Name)
            .Select(t => ToAdminResponse(t))
            .ToListAsync();

        return Ok(members);
    }

    [HttpGet("admin/{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<TeamMemberAdminResponse>> GetTeamMemberAdmin(
        int id,
        [FromQuery] int tenantId = 1)
    {
        var member = await _db.TeamMembers
            .AsNoTracking()
            .Where(t => t.TenantId == tenantId && t.Id == id)
            .FirstOrDefaultAsync();

        if (member is null)
        {
            return NotFound();
        }

        return Ok(ToAdminResponse(member));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<TeamMemberAdminResponse>> CreateTeamMember(SaveTeamMemberRequest request)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);

        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest("Name is required.");
        }

        var slugTaken = await _db.TeamMembers
            .AnyAsync(t => t.TenantId == request.TenantId && t.Slug == slug);

        if (slugTaken)
        {
            return BadRequest("A team member with this slug already exists.");
        }

        var member = new TeamMember
        {
            TenantId = request.TenantId,
            Name = request.Name,
            Slug = slug,
            Title = request.Title,
            Bio = request.Bio,
            PhotoUrl = request.PhotoUrl,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.TeamMembers.Add(member);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTeamMemberAdmin), new { id = member.Id }, ToAdminResponse(member));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<TeamMemberAdminResponse>> UpdateTeamMember(int id, SaveTeamMemberRequest request)
    {
        var member = await _db.TeamMembers.FindAsync(id);

        if (member is null)
        {
            return NotFound();
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);

        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest("Name is required.");
        }

        var slugTaken = await _db.TeamMembers
            .AnyAsync(t => t.TenantId == member.TenantId && t.Slug == slug && t.Id != id);

        if (slugTaken)
        {
            return BadRequest("A team member with this slug already exists.");
        }

        member.Name = request.Name;
        member.Slug = slug;
        member.Title = request.Title;
        member.Bio = request.Bio;
        member.PhotoUrl = request.PhotoUrl;
        member.SortOrder = request.SortOrder;
        member.IsActive = request.IsActive;

        await _db.SaveChangesAsync();

        return Ok(ToAdminResponse(member));
    }

    [HttpPut("{id:int}/active")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> SetTeamMemberActive(int id, SetTeamMemberActiveRequest request)
    {
        var member = await _db.TeamMembers.FindAsync(id);

        if (member is null)
        {
            return NotFound();
        }

        member.IsActive = request.IsActive;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static TeamMemberAdminResponse ToAdminResponse(TeamMember t) => new()
    {
        Id = t.Id,
        Slug = t.Slug,
        Name = t.Name,
        Title = t.Title,
        Bio = t.Bio,
        PhotoUrl = t.PhotoUrl,
        SortOrder = t.SortOrder,
        IsActive = t.IsActive
    };

    private static string Slugify(string? value)
    {
        var input = (value ?? string.Empty).Trim().ToLowerInvariant();
        var slug = Regex.Replace(input, "[^a-z0-9]+", "-").Trim('-');
        return slug;
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

public class TeamMemberAdminResponse
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? PhotoUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class SaveTeamMemberRequest
{
    public int TenantId { get; set; } = 1;
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Title { get; set; }
    public string? Bio { get; set; }
    public string? PhotoUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class SetTeamMemberActiveRequest
{
    public bool IsActive { get; set; }
}
