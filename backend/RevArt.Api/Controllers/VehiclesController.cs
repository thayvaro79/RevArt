using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.DTOs;
using RevArt.Core.Entities;
using RevArt.Core.Interfaces;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly RevArtDbContext _db;
    private readonly IVehicleService _vehicleService;

    public VehiclesController(RevArtDbContext db, IVehicleService vehicleService)
    {
        _db = db;
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehicleResponse>>> GetVehicles([FromQuery] int tenantId = 1)
    {
        var vehicles = await _db.Vehicles
            .AsNoTracking()
            .Include(v => v.Manufacturer)
            .Include(v => v.VehicleType)
            .Where(v => v.TenantId == tenantId)
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new VehicleResponse
            {
                Id = v.Id,
                Title = v.Title,
                Slug = v.Slug,
                Year = v.Year,
                ManufacturerName = v.Manufacturer.Name,
                VehicleTypeName = v.VehicleType.Name,
                Model = v.Model,
                Trim = v.Trim,
                Mileage = v.Mileage,
                Price = v.Price,
                Status = v.Status.ToString(),
                IsFeatured = v.IsFeatured,
                ExteriorColor = v.ExteriorColor,
                InteriorColor = v.InteriorColor,
                Description = v.Description,
                ImageUrl = v.ImageUrl
            })
            .ToListAsync();

        return Ok(vehicles);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<VehicleDetailResponseDto>> GetBySlug(string slug)
    {
        var vehicle = await _vehicleService.GetDetailBySlugAsync(slug);

        if (vehicle == null)
        {
            return NotFound();
        }

        return Ok(vehicle);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Vehicle>> GetVehicle(int id)
    {
        var vehicle = await _db.Vehicles
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vehicle is null)
        {
            return NotFound();
        }

        return Ok(vehicle);
    }

    [HttpPost]
    public async Task<ActionResult<Vehicle>> CreateVehicle(CreateVehicleRequest request)
    {
        var vehicle = new Vehicle
        {
            TenantId = request.TenantId,
            VehicleTypeId = request.VehicleTypeId,
            ManufacturerId = request.ManufacturerId,
            Title = request.Title,
            Slug = request.Slug,
            Year = request.Year,
            Model = request.Model,
            Trim = request.Trim,
            VIN = request.Vin,
            Mileage = request.Mileage,
            Transmission = request.Transmission,
            ExteriorColor = request.ExteriorColor,
            InteriorColor = request.InteriorColor,
            Price = request.Price,
            Status = request.Status,
            IsFeatured = request.IsFeatured,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.Id }, vehicle);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVehicle(int id, Vehicle vehicle)
    {
        if (id != vehicle.Id)
        {
            return BadRequest("Route id does not match vehicle id.");
        }

        var existingVehicle = await _db.Vehicles.FindAsync(id);

        if (existingVehicle is null)
        {
            return NotFound();
        }

        existingVehicle.TenantId = vehicle.TenantId;
        existingVehicle.VehicleTypeId = vehicle.VehicleTypeId;
        existingVehicle.Title = vehicle.Title;
        existingVehicle.Slug = vehicle.Slug;
        existingVehicle.Year = vehicle.Year;
        existingVehicle.ManufacturerId = vehicle.ManufacturerId;
        existingVehicle.Model = vehicle.Model;
        existingVehicle.Trim = vehicle.Trim;
        existingVehicle.VIN = vehicle.VIN;
        existingVehicle.Mileage = vehicle.Mileage;
        existingVehicle.Transmission = vehicle.Transmission;
        existingVehicle.ExteriorColor = vehicle.ExteriorColor;
        existingVehicle.InteriorColor = vehicle.InteriorColor;
        existingVehicle.Price = vehicle.Price;
        existingVehicle.Status = vehicle.Status;
        existingVehicle.IsFeatured = vehicle.IsFeatured;
        existingVehicle.Description = vehicle.Description;
        existingVehicle.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);

        if (vehicle is null)
        {
            return NotFound();
        }

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateVehicleRequest
{
    public int TenantId { get; set; }
    public int VehicleTypeId { get; set; }
    public int ManufacturerId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public int Year { get; set; }
    public string Model { get; set; } = string.Empty;
    public string? Trim { get; set; }
    public string? Vin { get; set; }
    public int? Mileage { get; set; }
    public string? Transmission { get; set; }
    public string? ExteriorColor { get; set; }
    public string? InteriorColor { get; set; }
    public decimal? Price { get; set; }
    public RevArt.Core.Enums.VehicleStatus Status { get; set; }
    public bool IsFeatured { get; set; }
    public string? Description { get; set; }
}

public class VehicleResponse
{
    public int Id { get; set; }
    public string VehicleTypeName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int Year { get; set; }
    public string ManufacturerName { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? Trim { get; set; }
    public int? Mileage { get; set; }
    public decimal? Price { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public string? ExteriorColor { get; set; }
    public string? InteriorColor { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}