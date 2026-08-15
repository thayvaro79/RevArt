using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Revart.ImageProcessor.Services;

public class BlobImageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobImageService(IConfiguration configuration)
    {
        var connectionString =
            configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException(
                "Azure Storage connection string is missing.");

        var containerName =
            configuration["AzureStorage:ContainerName"]
            ?? throw new InvalidOperationException(
                "Azure Storage container name is missing.");

        _containerClient =
            new BlobContainerClient(connectionString, containerName);
    }

    public async Task<MemoryStream> DownloadAsync(
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(blobName);

        var stream = new MemoryStream();

        await blobClient.DownloadToAsync(
            stream,
            cancellationToken);

        stream.Position = 0;

        return stream;
    }

    public async Task UploadAsync(
        string blobName,
        Stream stream,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        stream.Position = 0;

        var blobClient = _containerClient.GetBlobClient(blobName);

        var uploadOptions = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            }
        };

        await blobClient.UploadAsync(
            stream,
            uploadOptions,
            cancellationToken);
    }
}