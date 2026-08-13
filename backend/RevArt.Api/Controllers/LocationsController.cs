using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly RevArtDbContext _db;

    public LocationsController(RevArtDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LocationSummaryResponse>>> GetLocations(
        [FromQuery] int tenantId = 1)
    {
        var locations = await _db.Locations
            .AsNoTracking()
            .Where(l => l.TenantId == tenantId)
            .Where(l => l.IsActive)
            .OrderByDescending(l => l.IsPrimary)
            .ThenBy(l => l.Name)
            .ToListAsync();

        var locationIds = locations.Select(l => l.Id).ToList();

        var photos = await _db.LocationPhotos
            .AsNoTracking()
            .Where(p => locationIds.Contains(p.LocationId) && p.IsActive)
            .ToListAsync();

        var response = locations.Select(l => new LocationSummaryResponse
        {
            Id = l.Id,
            Slug = l.Slug,
            Name = l.Name,
            City = l.City,
            State = l.State,
            IsPrimary = l.IsPrimary,
            CoverImageUrl = ResolveCoverImageUrl(l.Id, photos)
        }).ToList();

        return Ok(response);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<LocationDetailResponse>> GetLocation(
        string slug,
        [FromQuery] int tenantId = 1)
    {
        var location = await _db.Locations
            .AsNoTracking()
            .Where(l => l.TenantId == tenantId)
            .Where(l => l.Slug == slug)
            .Where(l => l.IsActive)
            .FirstOrDefaultAsync();

        if (location is null)
        {
            return NotFound();
        }

        var photos = await _db.LocationPhotos
            .AsNoTracking()
            .Where(p => p.LocationId == location.Id && p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new LocationPhotoResponse
            {
                Id = p.Id,
                ImageUrl = p.ImageUrl,
                SortOrder = p.SortOrder,
                IsCover = p.IsCover
            })
            .ToListAsync();

        return Ok(new LocationDetailResponse
        {
            Id = location.Id,
            Slug = location.Slug,
            Name = location.Name,
            AddressLine1 = location.AddressLine1,
            AddressLine2 = location.AddressLine2,
            City = location.City,
            State = location.State,
            PostalCode = location.PostalCode,
            Country = location.Country,
            Phone = location.Phone,
            Email = location.Email,
            IsPrimary = location.IsPrimary,
            Photos = photos
        });
    }

    private static string? ResolveCoverImageUrl(int locationId, List<LocationPhoto> photos)
    {
        var locationPhotos = photos.Where(p => p.LocationId == locationId).ToList();

        return locationPhotos.Where(p => p.IsCover).Select(p => p.ImageUrl).FirstOrDefault()
            ?? locationPhotos.OrderBy(p => p.SortOrder).Select(p => p.ImageUrl).FirstOrDefault();
    }
}

public class LocationSummaryResponse
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? State { get; set; }
    public bool IsPrimary { get; set; }
    public string? CoverImageUrl { get; set; }
}

public class LocationDetailResponse
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
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
    public List<LocationPhotoResponse> Photos { get; set; } = new();
}

public class LocationPhotoResponse
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsCover { get; set; }
}
