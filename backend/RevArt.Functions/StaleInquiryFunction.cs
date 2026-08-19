using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RevArt.Infrastructure.Data;

namespace RevArt.Functions;

public class StaleInquiryFunction
{
    private readonly RevArtDbContext _dbContext;
    private readonly ILogger<StaleInquiryFunction> _logger;

    public StaleInquiryFunction(
        RevArtDbContext dbContext,
        ILogger<StaleInquiryFunction> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    [Function("StaleInquiryFunction")]
    public async Task Run(
        [TimerTrigger("0 */5 * * * *")] TimerInfo myTimer)
    {
        var now = DateTime.UtcNow;
        var cutoff = now.AddHours(-24);

        var staleInquiries = await _dbContext.Inquiries
            .Where(i =>
                i.Status == "New" &&
                i.CreatedAt <= cutoff)
            .ToListAsync();

        foreach (var inquiry in staleInquiries)
        {
            inquiry.Status = "FollowUpDue";
            inquiry.UpdatedAt = now;
        }

        if (staleInquiries.Count > 0)
        {
            await _dbContext.SaveChangesAsync();
        }

        _logger.LogInformation(
            "Stale inquiry scan completed at {ExecutionTime}. Updated {Count} inquiries.",
            now,
            staleInquiries.Count);
    }
}