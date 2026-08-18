using Microsoft.EntityFrameworkCore;
using RevArt.Core.DTOs;
using RevArt.Core.Interfaces;
using RevArt.Infrastructure.Data;

namespace RevArt.Infrastructure.Services;

public class VehicleSearchService : IVehicleSearchService
{
    private readonly RevArtDbContext _dbContext;

    public VehicleSearchService(RevArtDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<VehicleResponseDto>> SearchAsync(
        VehicleSearchIntent intent,
        int tenantId)
    {
        var query = _dbContext.Vehicles
            .AsNoTracking()
            .Where(v => v.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(intent.Manufacturer))
        {
            query = query.Where(v =>
                v.Manufacturer.Name == intent.Manufacturer);
        }

        if (!string.IsNullOrWhiteSpace(intent.VehicleType))
        {
            query = query.Where(v =>
                v.VehicleType.Name == intent.VehicleType);
        }

        if (!string.IsNullOrWhiteSpace(intent.Model))
        {
            query = query.Where(v =>
                v.Model == intent.Model);
        }

        if (!string.IsNullOrWhiteSpace(intent.Trim))
        {
            query = query.Where(v =>
                v.Trim == intent.Trim);
        }

        if (intent.MinYear.HasValue)
        {
            query = query.Where(v =>
                v.Year >= intent.MinYear.Value);
        }

        if (intent.MaxYear.HasValue)
        {
            query = query.Where(v =>
                v.Year <= intent.MaxYear.Value);
        }

        if (intent.MinMileage.HasValue)
        {
            query = query.Where(v =>
                v.Mileage >= intent.MinMileage.Value);
        }

        if (intent.MaxMileage.HasValue)
        {
            query = query.Where(v =>
                v.Mileage <= intent.MaxMileage.Value);
        }

        if (intent.MinPrice.HasValue)
        {
            query = query.Where(v =>
                v.Price >= intent.MinPrice.Value);
        }

        if (intent.MaxPrice.HasValue)
        {
            query = query.Where(v =>
                v.Price <= intent.MaxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(intent.Transmission))
        {
            query = query.Where(v =>
                v.Transmission == intent.Transmission);
        }

        if (!string.IsNullOrWhiteSpace(intent.ExteriorColor))
        {
            query = query.Where(v =>
                v.ExteriorColor == intent.ExteriorColor);
        }

        if (!string.IsNullOrWhiteSpace(intent.InteriorColor))
        {
            query = query.Where(v =>
                v.InteriorColor == intent.InteriorColor);
        }

        if (intent.IsFeatured.HasValue)
        {
            query = query.Where(v =>
                v.IsFeatured == intent.IsFeatured.Value);
        }

        return await query
            .Select(v => new VehicleResponseDto
            {
                Id = v.Id,
                VehicleTypeName = v.VehicleType.Name,
                Title = v.Title,
                Slug = v.Slug,
                Year = v.Year,
                ManufacturerName = v.Manufacturer.Name,
                Model = v.Model,
                Trim = v.Trim,
                Mileage = v.Mileage,
                Price = v.Price,
                Status = v.Status.ToString(),
                IsFeatured = v.IsFeatured,
                ExteriorColor = v.ExteriorColor,
                InteriorColor = v.InteriorColor,
                Description = v.Description,
                ImageUrl = v.Photos
                    .Where(p => p.IsActive)
                    .OrderByDescending(p => p.IsCover)
                    .ThenBy(p => p.SortOrder)
                    .Select(p => p.ImageUrl)
                    .FirstOrDefault()
            })
            .ToListAsync();
    }
}