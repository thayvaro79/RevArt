using Microsoft.AspNetCore.Mvc;
using RevArt.Core.DTOs;
using RevArt.Core.Interfaces;

namespace RevArt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiSearchController : ControllerBase
{
    private readonly IVehicleSearchInterpreter _searchInterpreter;
    private readonly IVehicleSearchService _vehicleSearchService;

    public AiSearchController(
        IVehicleSearchInterpreter searchInterpreter,
        IVehicleSearchService vehicleSearchService)
    {
        _searchInterpreter = searchInterpreter;
        _vehicleSearchService = vehicleSearchService;
    }

    [HttpPost]
    public async Task<IActionResult> Search(
        [FromBody] AiSearchRequest request,
        [FromQuery] int tenantId = 1,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return BadRequest("Search query is required.");
        }

        // Ask Azure OpenAI to interpret the natural-language query.
        var intent = await _searchInterpreter.InterpretAsync(
            request.Query,
            cancellationToken);

        // Use the extracted intent to search the vehicle inventory.
        var vehicles = await _vehicleSearchService.SearchAsync(
            intent,
            tenantId);

        return Ok(vehicles);
            }
}