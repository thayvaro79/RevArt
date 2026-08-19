namespace RevArt.Core.DTOs;

public class VinOcrResponseDto
{
    public bool Success { get; set; }

    public string? Vin { get; set; }

    public string? ErrorMessage { get; set; }
}
