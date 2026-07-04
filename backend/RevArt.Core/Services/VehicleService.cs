
using RevArt.Core.Interfaces;
using RevArt.Core.DTOs;

namespace RevArt.Core.Services;


public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepository;

    public VehicleService(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;
    }

    public async Task<VehicleDetailResponseDto?> GetDetailBySlugAsync(string slug)
    {
        var vehicle = await _vehicleRepository.GetBySlugWithPhotosAsync(slug);

        if (vehicle == null)
        {
            return null;
        }

        return new VehicleDetailResponseDto
        {
            Id = vehicle.Id,
            Title = vehicle.Title,
            Slug = vehicle.Slug,

            Manufacturer = vehicle.Manufacturer.Name,
            Model = vehicle.Model,
            Status = vehicle.Status.ToString(),

            Price = vehicle.Price,
            Year = vehicle.Year,
            Mileage = vehicle.Mileage,

            Vin = vehicle.VIN,
            Transmission = vehicle.Transmission,
            ExteriorColor = vehicle.ExteriorColor,
            InteriorColor = vehicle.InteriorColor,

            HeroTagline = vehicle.HeroTagline,
            OverviewText = vehicle.OverviewText,
            HistoryText = vehicle.HistoryText,
            TheCarText = vehicle.TheCarText,
            MarketNotes = vehicle.MarketNotes,
            ConditionReportText = vehicle.ConditionReportText,

            Photos = vehicle.Photos
                .OrderBy(p => p.SortOrder)
                .Select(p => new VehiclePhotoResponseDto
                {
                    Id = p.Id,
                    ImageUrl = p.ImageUrl,
                    AltText = p.AltText,
                    Category = p.Category,
                    Role = p.Role,
                    IsCover = p.IsCover,
                    SortOrder = p.SortOrder
                })
                .ToList()
        };
    }
}