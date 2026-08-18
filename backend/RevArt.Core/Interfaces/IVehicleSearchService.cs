using RevArt.Core.DTOs;

namespace RevArt.Core.Interfaces;

public interface IVehicleSearchService
{
Task<List<VehicleResponseDto>> SearchAsync(
    VehicleSearchIntent intent,
    int tenantId);
}