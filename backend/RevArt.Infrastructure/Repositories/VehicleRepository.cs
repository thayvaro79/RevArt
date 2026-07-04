using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;
using RevArt.Core.Interfaces;
using RevArt.Infrastructure.Data;

namespace RevArt.Infrastructure.Repositories;

public class VehicleRepository : IVehicleRepository
{
    private readonly RevArtDbContext _context;

    public VehicleRepository(RevArtDbContext context)
    {
        _context = context;
    }

    public async Task<Vehicle?> GetBySlugWithPhotosAsync(string slug)
    {
        return await _context.Vehicles
            .AsNoTracking()
            .Include(v => v.Manufacturer)
            .Include(v => v.VehicleType)
            .Include(v => v.Photos.Where(p => p.IsActive))
            .Include(v => v.Documents)
            .FirstOrDefaultAsync(v => v.Slug == slug);
    }
}