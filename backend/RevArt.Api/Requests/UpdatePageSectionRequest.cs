namespace RevArt.Api.Requests;

public class UpdatePageSectionRequest
{
    public int TenantId { get; set; } = 1;

    public string? Heading { get; set; }

    public string? Body { get; set; }

    public string? ImageUrl { get; set; }
}
