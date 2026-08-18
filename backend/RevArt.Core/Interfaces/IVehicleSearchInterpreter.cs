using RevArt.Core.DTOs;

namespace RevArt.Core.Interfaces;

public interface IVehicleSearchInterpreter
{
    Task<VehicleSearchIntent> InterpretAsync(
        string query,
        CancellationToken cancellationToken = default);
}