using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RevArt.Core.Entities;
using RevArt.Core.Interfaces;
using RevArt.Infrastructure.Data;
using RevArt.Api.Messaging;
namespace RevArt.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Editor")]
public class ImagesController : ControllerBase
{
    private readonly IBlobStorageService _blobStorageService;
    private readonly RevArtDbContext _dbContext;

    private readonly ImageUploadedMessageSender _messageSender;

    public ImagesController(
        IBlobStorageService blobStorageService,
        RevArtDbContext dbContext,
        ImageUploadedMessageSender messageSender)
    {
        _blobStorageService = blobStorageService;
        _dbContext = dbContext;
        _messageSender = messageSender;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromForm] int tenantId = 1,
        [FromForm] int vehicleId = 0,
        [FromForm] string category = "Exterior",
        [FromForm] int sortOrder = 0,
        [FromForm] bool isCover = false)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        if (vehicleId <= 0)
        {
            return BadRequest("VehicleId is required.");
        }

        await using var stream = file.OpenReadStream();

      var uploadResult = await _blobStorageService.UploadAsync(
    stream,
    file.FileName,
    file.ContentType,
    tenantId,
    vehicleId);

        var vehiclePhoto = new VehiclePhoto
        {
            VehicleId = vehicleId,
            ImageUrl = uploadResult.Url,
            BlobName = uploadResult.BlobName,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            CreatedUtc = DateTime.UtcNow,
            Category = category,
            SortOrder = sortOrder,
            IsCover = isCover,
            IsActive = true,
            Role = category,
            AltText = category
        };

        _dbContext.VehiclePhotos.Add(vehiclePhoto);
        await _dbContext.SaveChangesAsync();
        await _messageSender.SendAsync(
        new ImageUploadedMessage
         {
            VehicleId = vehiclePhoto.VehicleId,
            VehiclePhotoId = vehiclePhoto.Id,
            BlobName = vehiclePhoto.BlobName,
            ContentType = vehiclePhoto.ContentType
         });
        return Ok(new
        {
            id = vehiclePhoto.Id,
            url = vehiclePhoto.ImageUrl,
            vehiclePhoto.VehicleId,
            vehiclePhoto.Category,
            vehiclePhoto.SortOrder,
            vehiclePhoto.IsCover
        });
    }

    [HttpPut("{id:int}/cover")]
    public async Task<IActionResult> SetCover(int id)
    {
        var photo = await _dbContext.VehiclePhotos.FindAsync(id);

        if (photo is null)
        {
            return NotFound();
        }

        var otherCovers = await _dbContext.VehiclePhotos
            .Where(p => p.VehicleId == photo.VehicleId && p.Id != id && p.IsCover)
            .ToListAsync();

        foreach (var other in otherCovers)
        {
            other.IsCover = false;
        }

        photo.IsCover = true;

        await _dbContext.SaveChangesAsync();

        return Ok(new { id = photo.Id, photo.VehicleId, isCover = true });
    }

    [HttpPut("{id:int}/category")]
    public async Task<IActionResult> SetCategory(int id, SetPhotoCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Category))
        {
            return BadRequest("Category is required.");
        }

        var photo = await _dbContext.VehiclePhotos.FindAsync(id);

        if (photo is null)
        {
            return NotFound();
        }

        photo.Category = request.Category;
        photo.Role = request.Category;
        photo.AltText = request.Category;

        await _dbContext.SaveChangesAsync();

        return Ok(new { id = photo.Id, photo.Category });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePhoto(int id)
    {
        var photo = await _dbContext.VehiclePhotos.FindAsync(id);

        if (photo is null)
        {
            return NotFound();
        }

        var vehicleId = photo.VehicleId;
        var wasCover = photo.IsCover;

        if (!string.IsNullOrWhiteSpace(photo.BlobName))
        {
            // Delete the original plus the known generated variants the image
            // processor writes alongside it (same filename, sibling folder) —
            // best-effort: DeleteIfExistsAsync no-ops for variants that were
            // never generated (e.g. the processor hasn't run locally).
            await _blobStorageService.DeleteAsync(photo.BlobName);
            await _blobStorageService.DeleteAsync(photo.BlobName.Replace("/original/", "/thumbnail/"));
            await _blobStorageService.DeleteAsync(photo.BlobName.Replace("/original/", "/medium/"));
        }

        _dbContext.VehiclePhotos.Remove(photo);
        await _dbContext.SaveChangesAsync();

        if (wasCover)
        {
            var nextCover = await _dbContext.VehiclePhotos
                .Where(p => p.VehicleId == vehicleId && p.IsActive)
                .OrderBy(p => p.SortOrder)
                .FirstOrDefaultAsync();

            if (nextCover is not null)
            {
                nextCover.IsCover = true;
                await _dbContext.SaveChangesAsync();
            }
        }

        return NoContent();
    }

    [HttpPost("upload-content")]
    public async Task<IActionResult> UploadContentImage(
        IFormFile file,
        [FromForm] int tenantId = 1,
        [FromForm] string folder = "content")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        var safeFolder = SanitizeFolder(folder);

        await using var stream = file.OpenReadStream();

        var uploadResult = await _blobStorageService.UploadContentImageAsync(
            stream,
            file.FileName,
            file.ContentType,
            tenantId,
            safeFolder);

        return Ok(new
        {
            url = uploadResult.Url,
            blobName = uploadResult.BlobName
        });
    }

    private static string SanitizeFolder(string? folder)
    {
        var cleaned = Regex.Replace(folder ?? string.Empty, "[^a-zA-Z0-9/_-]", "");
        return string.IsNullOrWhiteSpace(cleaned) ? "content" : cleaned.ToLowerInvariant();
    }
}

public class SetPhotoCategoryRequest
{
    public string Category { get; set; } = string.Empty;
}