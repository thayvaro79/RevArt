using RevArt.Core.DTOs;

namespace RevArt.Core.Interfaces;

public interface IVehicleEditorialDraftService
{
    Task<string> GenerateDraftAsync(
        VehicleEditorialDraftRequestDto request,
        CancellationToken cancellationToken = default);
}
