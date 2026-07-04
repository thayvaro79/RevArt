using RevArt.Core.DTOs;

namespace RevArt.Core.Interfaces;

public interface IVehicleService
{
    Task<VehicleDetailResponseDto?> GetDetailBySlugAsync(string slug);
}