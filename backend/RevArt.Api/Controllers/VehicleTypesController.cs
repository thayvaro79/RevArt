using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Editor")]
public class VehicleTypesController : ControllerBase
{
    private readonly RevArtDbContext _db;

    public VehicleTypesController(RevArtDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LookupResponse>>> GetVehicleTypes()
    {
        var vehicleTypes = await _db.VehicleTypes
            .AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new LookupResponse { Id = t.Id, Name = t.Name })
            .ToListAsync();

        return Ok(vehicleTypes);
    }

    [HttpPost]
    public async Task<ActionResult<LookupResponse>> CreateVehicleType(CreateLookupRequest request)
    {
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest("Name is required.");
        }

        var existing = await _db.VehicleTypes
            .FirstOrDefaultAsync(t => t.Name.ToLower() == name.ToLower());

        if (existing is not null)
        {
            return Ok(new LookupResponse { Id = existing.Id, Name = existing.Name });
        }

        var vehicleType = new VehicleType { Name = name };

        _db.VehicleTypes.Add(vehicleType);
        await _db.SaveChangesAsync();

        return Ok(new LookupResponse { Id = vehicleType.Id, Name = vehicleType.Name });
    }
}
