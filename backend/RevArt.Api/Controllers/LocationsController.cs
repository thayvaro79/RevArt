using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
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

    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<IEnumerable<LocationAdminResponse>>> GetLocationsAdmin(
        [FromQuery] int tenantId = 1)
    {
        var locations = await _db.Locations
            .AsNoTracking()
            .Where(l => l.TenantId == tenantId)
            .OrderByDescending(l => l.IsPrimary)
            .ThenBy(l => l.Name)
            .Select(l => ToAdminResponse(l))
            .ToListAsync();

        return Ok(locations);
    }

    [HttpGet("admin/{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<LocationAdminResponse>> GetLocationAdmin(
        int id,
        [FromQuery] int tenantId = 1)
    {
        var location = await _db.Locations
            .AsNoTracking()
            .Where(l => l.TenantId == tenantId && l.Id == id)
            .FirstOrDefaultAsync();

        if (location is null)
        {
            return NotFound();
        }

        return Ok(ToAdminResponse(location));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<LocationAdminResponse>> CreateLocation(SaveLocationRequest request)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);

        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest("Name is required.");
        }

        var slugTaken = await _db.Locations
            .AnyAsync(l => l.TenantId == request.TenantId && l.Slug == slug);

        if (slugTaken)
        {
            return BadRequest("A location with this slug already exists.");
        }

        var location = new Location
        {
            TenantId = request.TenantId,
            Name = request.Name,
            Slug = slug,
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            Country = request.Country,
            Phone = request.Phone,
            Email = request.Email,
            IsPrimary = request.IsPrimary,
            IsActive = request.IsActive
        };

        _db.Locations.Add(location);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLocationAdmin), new { id = location.Id }, ToAdminResponse(location));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<LocationAdminResponse>> UpdateLocation(int id, SaveLocationRequest request)
    {
        var location = await _db.Locations.FindAsync(id);

        if (location is null)
        {
            return NotFound();
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slugify(request.Name) : Slugify(request.Slug);

        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(slug))
        {
            return BadRequest("Name is required.");
        }

        var slugTaken = await _db.Locations
            .AnyAsync(l => l.TenantId == location.TenantId && l.Slug == slug && l.Id != id);

        if (slugTaken)
        {
            return BadRequest("A location with this slug already exists.");
        }

        location.Name = request.Name;
        location.Slug = slug;
        location.AddressLine1 = request.AddressLine1;
        location.AddressLine2 = request.AddressLine2;
        location.City = request.City;
        location.State = request.State;
        location.PostalCode = request.PostalCode;
        location.Country = request.Country;
        location.Phone = request.Phone;
        location.Email = request.Email;
        location.IsPrimary = request.IsPrimary;
        location.IsActive = request.IsActive;

        await _db.SaveChangesAsync();

        return Ok(ToAdminResponse(location));
    }

    [HttpPut("{id:int}/active")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> SetLocationActive(int id, SetLocationActiveRequest request)
    {
        var location = await _db.Locations.FindAsync(id);

        if (location is null)
        {
            return NotFound();
        }

        location.IsActive = request.IsActive;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static LocationAdminResponse ToAdminResponse(Location l) => new()
    {
        Id = l.Id,
        Slug = l.Slug,
        Name = l.Name,
        AddressLine1 = l.AddressLine1,
        AddressLine2 = l.AddressLine2,
        City = l.City,
        State = l.State,
        PostalCode = l.PostalCode,
        Country = l.Country,
        Phone = l.Phone,
        Email = l.Email,
        IsPrimary = l.IsPrimary,
        IsActive = l.IsActive
    };

    private static string Slugify(string? value)
    {
        var input = (value ?? string.Empty).Trim().ToLowerInvariant();
        var slug = Regex.Replace(input, "[^a-z0-9]+", "-").Trim('-');
        return slug;
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

public class LocationAdminResponse
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
    public bool IsActive { get; set; }
}

public class SaveLocationRequest
{
    public int TenantId { get; set; } = 1;
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
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

public class SetLocationActiveRequest
{
    public bool IsActive { get; set; }
}
