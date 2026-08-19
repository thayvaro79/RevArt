using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RevArt.Core.Entities;

namespace RevArt.Infrastructure.Services;

/// <summary>
/// Ensures the Admin/Editor roles exist and that a first Admin account can be
/// established from configuration. Safe to run on every startup: it is a
/// no-op once the roles exist and an Admin account has been created.
/// </summary>
public static class IdentitySeeder
{
    public static readonly string[] Roles = { "Admin", "Editor" };

    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var db = scope.ServiceProvider.GetRequiredService<Data.RevArtDbContext>();

        foreach (var roleName in Roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole(roleName));
            }
        }

        var bootstrapEmail = configuration["AdminBootstrap:Email"];
        var bootstrapPassword = configuration["AdminBootstrap:Password"];

        if (string.IsNullOrWhiteSpace(bootstrapEmail) || string.IsNullOrWhiteSpace(bootstrapPassword))
        {
            // No bootstrap credentials configured (e.g. an Admin already exists and
            // the deploy pipeline no longer supplies them). Nothing to do.
            return;
        }

        var existingUser = await userManager.FindByEmailAsync(bootstrapEmail);

        if (existingUser is not null)
        {
            if (!await userManager.IsInRoleAsync(existingUser, "Admin"))
            {
                await userManager.AddToRoleAsync(existingUser, "Admin");
            }

            return;
        }

        var anyAdminExists = (await userManager.GetUsersInRoleAsync("Admin")).Count > 0;

        if (anyAdminExists)
        {
            // An Admin already exists under a different email; don't silently
            // create another account just because bootstrap config is still set.
            return;
        }

        var defaultTenantId = await db.Tenants
            .OrderBy(t => t.Id)
            .Select(t => t.Id)
            .FirstOrDefaultAsync();

        if (defaultTenantId == 0)
        {
            // No tenant exists yet to attach the bootstrap Admin to.
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = bootstrapEmail,
            Email = bootstrapEmail,
            EmailConfirmed = true,
            TenantId = defaultTenantId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(admin, bootstrapPassword);

        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}
