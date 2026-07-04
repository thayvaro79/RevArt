using Microsoft.AspNetCore.Mvc;
using RevArt.Api.Requests;
using RevArt.Core.Entities;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InquiriesController : ControllerBase
{
    private readonly RevArtDbContext _db;

    public InquiriesController(RevArtDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateInquiryRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var inquiry = new Inquiry
        {
            TenantId = request.TenantId,
            VehicleId = request.VehicleId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Message = request.Message,
            SubscribeToNewsletter = request.SubscribeToNewsletter,
            SourcePage = request.SourcePage,
            Status = "New"
        };

        _db.Inquiries.Add(inquiry);

        await _db.SaveChangesAsync();

        return Ok(inquiry.Id);
    }
}