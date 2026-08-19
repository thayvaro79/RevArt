namespace RevArt.Api.Requests;

public class UpdatePageHeroRequest
{
    public int TenantId { get; set; } = 1;

    public string? EyebrowText { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Subtitle { get; set; }

    public string? ButtonText { get; set; }

    public string? ButtonUrl { get; set; }

    public string? ImageUrl { get; set; }
}
