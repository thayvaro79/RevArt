namespace RevArt.Core.Entities;

public class VehiclePhoto
{
    public int Id { get; set; }

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;

    public string? AltText { get; set; }

    public string Category { get; set; } = "Exterior";
    // Exterior, Interior, Engine, Trunk, Document, Other

    public string Role { get; set; } = "Gallery";
    // Hero, Overview, Gallery, Feature, Cover

    public bool IsCover { get; set; }

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; }
}

