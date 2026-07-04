namespace RevArt.Api.Requests;

public class CreateInquiryRequest
{
    public int TenantId { get; set; } = 1;

    public int? VehicleId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool SubscribeToNewsletter { get; set; }

    public string SourcePage { get; set; } = "Garage";
}