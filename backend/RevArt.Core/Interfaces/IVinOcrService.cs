using RevArt.Core.Models;

namespace RevArt.Core.Interfaces;

public interface IVinOcrService
{
    Task<VinOcrResult> ExtractVinAsync(Stream imageStream, string contentType, CancellationToken cancellationToken = default);
}
