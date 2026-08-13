namespace RevArt.Core.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        int tenantId,
        int vehicleId);
}