namespace RevArt.Api.Messaging;

public class ImageUploadedMessage
{
    public int VehicleId { get; set; }
    public int VehiclePhotoId { get; set; }
    public string BlobName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}