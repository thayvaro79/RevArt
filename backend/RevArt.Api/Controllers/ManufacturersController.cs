using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Editor")]
public class ManufacturersController : ControllerBase
{
    private readonly RevArtDbContext _db;

    public ManufacturersController(RevArtDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LookupResponse>>> GetManufacturers()
    {
        var manufacturers = await _db.Manufacturers
            .AsNoTracking()
            .OrderBy(m => m.Name)
            .Select(m => new LookupResponse { Id = m.Id, Name = m.Name })
            .ToListAsync();

        return Ok(manufacturers);
    }

    [HttpPost]
    public async Task<ActionResult<LookupResponse>> CreateManufacturer(CreateLookupRequest request)
    {
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest("Name is required.");
        }

        var existing = await _db.Manufacturers
            .FirstOrDefaultAsync(m => m.Name.ToLower() == name.ToLower());

        if (existing is not null)
        {
            return Ok(new LookupResponse { Id = existing.Id, Name = existing.Name });
        }

        var manufacturer = new Manufacturer
        {
            Name = name,
            Slug = name.ToLower().Replace(" ", "-")
        };

        _db.Manufacturers.Add(manufacturer);
        await _db.SaveChangesAsync();

        return Ok(new LookupResponse { Id = manufacturer.Id, Name = manufacturer.Name });
    }
}

public class LookupResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateLookupRequest
{
    public string Name { get; set; } = string.Empty;
}
