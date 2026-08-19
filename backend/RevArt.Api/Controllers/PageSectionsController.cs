using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Api.Requests;
using RevArt.Core.Entities;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PageSectionsController : ControllerBase
{
    private readonly RevArtDbContext _db;

    public PageSectionsController(RevArtDbContext db)
    {
        _db = db;
    }

    [HttpGet("{pageName}")]
    public async Task<ActionResult<IEnumerable<PageSectionResponse>>> GetPageSections(
        string pageName,
        [FromQuery] int tenantId = 1)
    {
        var sections = await _db.PageSections
            .AsNoTracking()
            .Where(s => s.TenantId == tenantId)
            .Where(s => s.PageName == pageName)
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .Select(s => new PageSectionResponse
            {
                Id = s.Id,
                PageName = s.PageName,
                SectionKey = s.SectionKey,
                Heading = s.Heading,
                Body = s.Body,
                ImageUrl = s.ImageUrl,
                SortOrder = s.SortOrder
            })
            .ToListAsync();

        return Ok(sections);
    }

    [HttpPut("{pageName}/{sectionKey}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<PageSectionResponse>> UpdatePageSection(
        string pageName,
        string sectionKey,
        [FromBody] UpdatePageSectionRequest request)
    {
        var section = await _db.PageSections
            .Where(s => s.TenantId == request.TenantId)
            .Where(s => s.PageName == pageName)
            .Where(s => s.SectionKey == sectionKey)
            .FirstOrDefaultAsync();

        if (section is null)
        {
            var maxSortOrder = await _db.PageSections
                .Where(s => s.TenantId == request.TenantId)
                .Where(s => s.PageName == pageName)
                .Select(s => (int?)s.SortOrder)
                .MaxAsync();

            section = new PageSection
            {
                TenantId = request.TenantId,
                PageName = pageName,
                SectionKey = sectionKey,
                SortOrder = (maxSortOrder ?? 0) + 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.PageSections.Add(section);
        }

        section.Heading = request.Heading;
        section.Body = request.Body;
        section.ImageUrl = request.ImageUrl;
        section.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new PageSectionResponse
        {
            Id = section.Id,
            PageName = section.PageName,
            SectionKey = section.SectionKey,
            Heading = section.Heading,
            Body = section.Body,
            ImageUrl = section.ImageUrl,
            SortOrder = section.SortOrder
        });
    }
}

public class PageSectionResponse
{
    public int Id { get; set; }
    public string PageName { get; set; } = string.Empty;
    public string SectionKey { get; set; } = string.Empty;
    public string? Heading { get; set; }
    public string? Body { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
}
