namespace RevArt.Core.Entities;

public class VehiclePhoto
{
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? AltText { get; set; }

    public int SortOrder { get; set; }

    public bool IsCover { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    // Blob metadata
    public string? BlobName { get; set; }

    public string? OriginalFileName { get; set; }

    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    public DateTime? CreatedUtc { get; set; }

    public Vehicle? Vehicle { get; set; }
}