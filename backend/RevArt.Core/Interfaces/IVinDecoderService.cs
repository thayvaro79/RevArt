using RevArt.Core.Models;

namespace RevArt.Core.Interfaces;

public interface IVinDecoderService
{
    Task<VinDecodeResult> DecodeAsync(string vin, CancellationToken cancellationToken = default);
}
