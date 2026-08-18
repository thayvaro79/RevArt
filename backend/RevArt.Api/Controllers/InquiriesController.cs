using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InquiryResponse>>> GetInquiries(
        [FromQuery] int tenantId = 1)
    {
        var inquiries = await _db.Inquiries
            .AsNoTracking()
            .Include(i => i.Vehicle)
            .Where(i => i.TenantId == tenantId)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InquiryResponse
            {
                Id = i.Id,
                VehicleId = i.VehicleId,
                VehicleTitle = i.Vehicle != null ? i.Vehicle.Title : null,
                VehicleSlug = i.Vehicle != null ? i.Vehicle.Slug : null,
                FirstName = i.FirstName,
                LastName = i.LastName,
                Email = i.Email,
                Phone = i.Phone,
                Message = i.Message,
                SubscribeToNewsletter = i.SubscribeToNewsletter,
                SourcePage = i.SourcePage,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync();

        return Ok(inquiries);
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

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateInquiryStatusRequest request)
    {
        var inquiry = await _db.Inquiries.FindAsync(id);

        if (inquiry is null)
        {
            return NotFound();
        }

        inquiry.Status = request.Status;
        inquiry.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public class InquiryResponse
{
    public int Id { get; set; }
    public int? VehicleId { get; set; }
    public string? VehicleTitle { get; set; }
    public string? VehicleSlug { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool SubscribeToNewsletter { get; set; }
    public string SourcePage { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class UpdateInquiryStatusRequest
{
    public string Status { get; set; } = string.Empty;
}