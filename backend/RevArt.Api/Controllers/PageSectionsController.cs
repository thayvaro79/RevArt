using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
