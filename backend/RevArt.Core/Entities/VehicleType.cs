namespace RevArt.Core.Entities;

public class VehicleType
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}