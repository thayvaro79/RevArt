using Microsoft.AspNetCore.Mvc;
using RevArt.Core.Entities;
using RevArt.Core.Interfaces;
using RevArt.Infrastructure.Data;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly IBlobStorageService _blobStorageService;
    private readonly RevArtDbContext _dbContext;

    public ImagesController(
        IBlobStorageService blobStorageService,
        RevArtDbContext dbContext)
    {
        _blobStorageService = blobStorageService;
        _dbContext = dbContext;
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

        var imageUrl = await _blobStorageService.UploadAsync(
            stream,
            file.FileName,
            file.ContentType,
            tenantId,
            vehicleId);

        var vehiclePhoto = new VehiclePhoto
        {
            VehicleId = vehicleId,
            ImageUrl = imageUrl,
            BlobName = file.FileName,
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
}