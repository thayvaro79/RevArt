using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
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
    private static readonly Regex VinPattern = new("^[A-HJ-NPR-Z0-9]{17}$", RegexOptions.Compiled);

    private readonly RevArtDbContext _db;
    private readonly IVehicleService _vehicleService;
    private readonly IVinDecoderService _vinDecoderService;
    private readonly IVinOcrService _vinOcrService;

    public VehiclesController(
        RevArtDbContext db,
        IVehicleService vehicleService,
        IVinDecoderService vinDecoderService,
        IVinOcrService vinOcrService)
    {
        _db = db;
        _vehicleService = vehicleService;
        _vinDecoderService = vinDecoderService;
        _vinOcrService = vinOcrService;
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
            .ToListAsync();

        var vehicleIds = vehicles.Select(v => v.Id).ToList();

        var photos = await _db.VehiclePhotos
            .AsNoTracking()
            .Where(p => vehicleIds.Contains(p.VehicleId) && p.IsActive)
            .ToListAsync();

        var response = vehicles.Select(v => new VehicleResponse
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
            ImageUrl = photos
                .Where(p => p.VehicleId == v.Id)
                .OrderByDescending(p => p.IsCover)
                .ThenBy(p => p.SortOrder)
                .Select(p => p.ImageUrl)
                .FirstOrDefault()
        }).ToList();

        return Ok(response);
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
    [Authorize(Roles = "Admin,Editor")]
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

    [HttpGet("{id:int}/photos")]
    public async Task<ActionResult<List<VehiclePhotoResponseDto>>> GetPhotos(int id)
    {
        var photos = await _db.VehiclePhotos
            .AsNoTracking()
            .Where(p => p.VehicleId == id && p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Select(p => new VehiclePhotoResponseDto
            {
                Id = p.Id,
                ImageUrl = p.ImageUrl,
                AltText = p.AltText,
                Category = p.Category,
                Role = p.Role,
                IsCover = p.IsCover,
                SortOrder = p.SortOrder
            })
            .ToListAsync();

        return Ok(photos);
    }

    [HttpGet("decode-vin/{vin}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<DecodeVinResponseDto>> DecodeVin(string vin)
    {
        var normalizedVin = (vin ?? string.Empty).Trim().ToUpperInvariant();

        if (!VinPattern.IsMatch(normalizedVin))
        {
            return BadRequest("VIN must be 17 characters (letters and digits, excluding I, O, Q).");
        }

        var decoded = await _vinDecoderService.DecodeAsync(normalizedVin);

        var response = new DecodeVinResponseDto
        {
            Vin = normalizedVin,
            Success = decoded.Success,
            ErrorMessage = decoded.ErrorMessage,
            Year = decoded.Year,
            Model = decoded.Model,
            Trim = decoded.Trim,
            Transmission = decoded.Transmission,
            ManufacturerName = decoded.Make,
            VehicleTypeName = decoded.BodyClass
        };

        if (!decoded.Success)
        {
            return Ok(response);
        }

        if (!string.IsNullOrWhiteSpace(decoded.Make))
        {
            var manufacturer = await _db.Manufacturers
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Name.ToLower() == decoded.Make.ToLower());

            if (manufacturer is not null)
            {
                response.ManufacturerId = manufacturer.Id;
                response.ManufacturerName = manufacturer.Name;
            }
            else
            {
                response.Warnings.Add($"Manufacturer \"{decoded.Make}\" wasn't found — select an existing one or add it.");
            }
        }

        if (!string.IsNullOrWhiteSpace(decoded.BodyClass))
        {
            var vehicleTypes = await _db.VehicleTypes.AsNoTracking().ToListAsync();
            var matchedType = MatchVehicleType(decoded.BodyClass, vehicleTypes);

            if (matchedType is not null)
            {
                response.VehicleTypeId = matchedType.Id;
                response.VehicleTypeName = matchedType.Name;
            }
            else
            {
                response.Warnings.Add($"Vehicle type \"{decoded.BodyClass}\" has no clear match — select it manually.");
            }
        }

        return Ok(response);
    }

    [HttpPost("ocr-vin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<VinOcrResponseDto>> OcrVin(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No image uploaded.");
        }

        await using var stream = file.OpenReadStream();

        var result = await _vinOcrService.ExtractVinAsync(stream, file.ContentType);

        return Ok(new VinOcrResponseDto
        {
            Success = result.Success,
            Vin = result.Vin,
            ErrorMessage = result.ErrorMessage
        });
    }

    private static VehicleType? MatchVehicleType(string bodyClass, List<VehicleType> existingTypes)
    {
        var normalized = bodyClass.Trim().ToLowerInvariant();

        var exact = existingTypes.FirstOrDefault(t => t.Name.ToLower() == normalized);
        if (exact is not null)
        {
            return exact;
        }

        // vPIC often returns compound, slash-separated labels (e.g. "Sedan/Saloon",
        // "Convertible/Cabriolet") — match if any segment exactly matches an existing type.
        var segments = normalized.Split('/', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        foreach (var segment in segments)
        {
            var segmentMatch = existingTypes.FirstOrDefault(t => t.Name.ToLower() == segment);
            if (segmentMatch is not null)
            {
                return segmentMatch;
            }
        }

        // Fall back to substring containment (e.g. "Sport Utility Vehicle (SUV)" contains "suv").
        var containment = existingTypes.FirstOrDefault(t => normalized.Contains(t.Name.ToLower()));
        if (containment is not null)
        {
            return containment;
        }

        // A few known vPIC wordings that share no substring with RevArt's type names.
        // Only used if that exact type already exists — never invent new reference data.
        var synonymMap = new (string Keyword, string Category)[]
        {
            ("pickup", "Truck"),
            ("cabriolet", "Convertible"),
            ("roadster", "Convertible"),
        };

        var matchedCategory = synonymMap
            .Where(s => normalized.Contains(s.Keyword))
            .Select(s => s.Category)
            .FirstOrDefault();

        return matchedCategory is null
            ? null
            : existingTypes.FirstOrDefault(t => t.Name.ToLower() == matchedCategory.ToLower());
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
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
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UpdateVehicle(int id, UpdateVehicleRequest request)
    {
        var existingVehicle = await _db.Vehicles.FindAsync(id);

        if (existingVehicle is null)
        {
            return NotFound();
        }

        var manufacturerExists = await _db.Manufacturers.AnyAsync(m => m.Id == request.ManufacturerId);

        if (!manufacturerExists)
        {
            return BadRequest("Manufacturer not found.");
        }

        var vehicleTypeExists = await _db.VehicleTypes.AnyAsync(t => t.Id == request.VehicleTypeId);

        if (!vehicleTypeExists)
        {
            return BadRequest("Vehicle type not found.");
        }

        // TenantId and VIN identify the vehicle and its tenant boundary — they are
        // intentionally not part of this request and can never be changed here.
        // A wrong VIN should be corrected by deleting and recreating the Draft,
        // not by silently changing identity.
        existingVehicle.VehicleTypeId = request.VehicleTypeId;
        existingVehicle.Title = request.Title;
        existingVehicle.Slug = request.Slug;
        existingVehicle.Year = request.Year;
        existingVehicle.ManufacturerId = request.ManufacturerId;
        existingVehicle.Model = request.Model;
        existingVehicle.Trim = request.Trim;
        existingVehicle.Mileage = request.Mileage;
        existingVehicle.Transmission = request.Transmission;
        existingVehicle.ExteriorColor = request.ExteriorColor;
        existingVehicle.InteriorColor = request.InteriorColor;
        existingVehicle.Price = request.Price;
        existingVehicle.Status = request.Status;
        existingVehicle.IsFeatured = request.IsFeatured;
        existingVehicle.Description = request.Description;
        existingVehicle.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
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

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateVehicleStatusRequest request)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);

        if (vehicle is null)
        {
            return NotFound();
        }

        vehicle.Status = request.Status;
        vehicle.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public class UpdateVehicleStatusRequest
{
    public RevArt.Core.Enums.VehicleStatus Status { get; set; }
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

public class UpdateVehicleRequest
{
    public int VehicleTypeId { get; set; }
    public int ManufacturerId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public int Year { get; set; }
    public string Model { get; set; } = string.Empty;
    public string? Trim { get; set; }
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