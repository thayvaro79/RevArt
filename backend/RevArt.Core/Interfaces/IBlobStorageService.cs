namespace RevArt.Core.Interfaces;
using RevArt.Core.Models;
public interface IBlobStorageService
{
   Task<BlobUploadResult> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        int tenantId,
        int vehicleId);
}