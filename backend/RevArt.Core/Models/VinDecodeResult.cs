namespace RevArt.Core.Models;

public class VinDecodeResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }

    public int? Year { get; set; }
    public string? Make { get; set; }
    public string? Model { get; set; }
    public string? Trim { get; set; }
    public string? BodyClass { get; set; }
    public string? Transmission { get; set; }
}
