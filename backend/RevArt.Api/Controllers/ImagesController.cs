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