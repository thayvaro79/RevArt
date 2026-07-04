using RevArt.Core.Entities;

namespace RevArt.Core.Interfaces;

public interface IVehicleRepository
{
    Task<Vehicle?> GetBySlugWithPhotosAsync(string slug);
}