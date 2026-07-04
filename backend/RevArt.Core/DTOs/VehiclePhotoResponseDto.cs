namespace RevArt.Core.DTOs;

public class VehiclePhotoResponseDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsCover { get; set; }
    public int SortOrder { get; set; }
}