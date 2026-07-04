using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PageHeroesController : ControllerBase
{
    private readonly RevArtDbContext _db;

    public PageHeroesController(RevArtDbContext db)
    {
        _db = db;
    }

    [HttpGet("{pageKey}")]
    public async Task<ActionResult<PageHeroResponse>> GetPageHero(
        string pageKey,
        [FromQuery] int tenantId = 1)
    {
        var hero = await _db.PageHeroes
            .AsNoTracking()
            .Where(h => h.TenantId == tenantId)
            .Where(h => h.PageKey == pageKey)
            .Where(h => h.IsActive)
            .OrderBy(h => h.DisplayOrder)
            .Select(h => new PageHeroResponse
            {
                Id = h.Id,
                PageKey = h.PageKey,
                PageName = h.PageName,
                HeroType = h.HeroType,
                EyebrowText = h.EyebrowText,
                Title = h.Title,
                Subtitle = h.Subtitle,
                ButtonText = h.ButtonText,
                ButtonUrl = h.ButtonUrl,
                ImageUrl = h.ImageUrl
            })
            .FirstOrDefaultAsync();

        if (hero is null)
        {
            return NotFound();
        }

        return Ok(hero);
    }
}

public class PageHeroResponse
{
    public int Id { get; set; }
    public string PageKey { get; set; } = string.Empty;
    public string PageName { get; set; } = string.Empty;
    public string HeroType { get; set; } = string.Empty;
    public string? EyebrowText { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? ButtonText { get; set; }
    public string? ButtonUrl { get; set; }
    public string? ImageUrl { get; set; }
}