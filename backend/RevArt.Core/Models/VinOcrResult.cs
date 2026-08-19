namespace RevArt.Core.Models;

public class VinOcrResult
{
    public bool Success { get; set; }
    public string? Vin { get; set; }
    public string? ErrorMessage { get; set; }
}
