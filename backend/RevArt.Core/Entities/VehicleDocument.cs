namespace RevArt.Core.Entities;

public class VehicleDocument
{
    public int Id { get; set; }

    public int VehicleId { get; set; }
    public Vehicle Vehicle { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string DocumentUrl { get; set; } = string.Empty;

    public bool IsPublic { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
