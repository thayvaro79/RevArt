using Azure.Messaging.ServiceBus;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using RevArt.Api.Controllers;
using RevArt.Api.Messaging;
using RevArt.Core.Entities;
using RevArt.Core.Interfaces;
using RevArt.Core.Services;
using RevArt.Infrastructure.Data;
using RevArt.Infrastructure.Repositories;
using RevArt.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// --------------------
// CORS
// --------------------

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDevClient", policy =>
    {
        policy
            .WithOrigins(
                // Vite's default dev port, plus its automatic fallbacks when 5173
                // is already taken by another local dev server instance.
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "https://lemon-grass-0d3e50a0f.7.azurestaticapps.net",
                "https://revartgarage.com",
                "https://www.revartgarage.com")
            .AllowAnyHeader()
            .AllowAnyMethod()
            // The Admin SPA authenticates via an HttpOnly cookie, so the
            // browser must be allowed to send it cross-origin.
            .AllowCredentials();
    });
});

// --------------------
// Services
// --------------------

builder.Services
    .AddControllers()
    .AddApplicationPart(typeof(VehiclesController).Assembly);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --------------------
// Database
// --------------------

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is missing.");
}

builder.Services.AddDbContext<RevArtDbContext>(options =>
    options.UseSqlServer(connectionString));

// --------------------
// Identity / Authentication
// --------------------

builder.Services
    .AddIdentity<ApplicationUser, ApplicationRole>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;

        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.AllowedForNewUsers = true;

        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<RevArtDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "RevArt.Admin.Auth";
    options.Cookie.HttpOnly = true;

    // Locally the SPA and API are same-site but different ports (both
    // localhost), so Lax + SameAsRequest works over plain http. In any
    // deployed environment the SPA and API are on different domains, which
    // requires SameSite=None + Secure for the cookie to travel cross-site.
    options.Cookie.SameSite = builder.Environment.IsDevelopment()
        ? SameSiteMode.Lax
        : SameSiteMode.None;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;

    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;

    // This is an API, not an MVC app with login pages — never redirect,
    // return the status code and let the SPA react to it.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

// --------------------
// Service Bus
// --------------------

var serviceBusConnectionString =
    builder.Configuration["ServiceBus:ConnectionString"]
    ?? throw new InvalidOperationException(
        "Service Bus connection string is missing.");

builder.Services.AddSingleton(
    new ServiceBusClient(serviceBusConnectionString));

builder.Services.AddSingleton<ImageUploadedMessageSender>();

// --------------------
// Dependency Injection
// --------------------

builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
builder.Services.AddScoped<IVehicleSearchService, VehicleSearchService>();

builder.Services.AddHttpClient<IVinDecoderService, NhtsaVinDecoderService>(client =>
{
    client.BaseAddress = new Uri("https://vpic.nhtsa.dot.gov/api/vehicles/");
    client.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddScoped<IVehicleSearchInterpreter>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();

    var endpoint = configuration["AzureOpenAI:Endpoint"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI endpoint is missing.");

    var apiKey = configuration["AzureOpenAI:ApiKey"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI API key is missing.");

    var deploymentName = configuration["AzureOpenAI:DeploymentName"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI deployment name is missing.");

    return new AzureVehicleSearchInterpreter(
        endpoint,
        apiKey,
        deploymentName);
});

builder.Services.AddScoped<IVinOcrService>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();

    var endpoint = configuration["AzureOpenAI:Endpoint"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI endpoint is missing.");

    var apiKey = configuration["AzureOpenAI:ApiKey"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI API key is missing.");

    var deploymentName = configuration["AzureOpenAI:DeploymentName"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI deployment name is missing.");

    return new AzureVinOcrService(
        endpoint,
        apiKey,
        deploymentName);
});

builder.Services.AddScoped<IVehicleEditorialDraftService>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();

    var endpoint = configuration["AzureOpenAI:Endpoint"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI endpoint is missing.");

    var apiKey = configuration["AzureOpenAI:ApiKey"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI API key is missing.");

    var deploymentName = configuration["AzureOpenAI:DeploymentName"]
        ?? throw new InvalidOperationException(
            "Azure OpenAI deployment name is missing.");

    return new AzureVehicleEditorialDraftService(
        endpoint,
        apiKey,
        deploymentName);
});

// --------------------
// Build
// --------------------

var app = builder.Build();

// --------------------
// Middleware
// --------------------

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Explicit routing before CORS
app.UseRouting();

// Apply CORS policy after routing and before authentication/authorization/endpoints
app.UseCors("AllowReactDevClient");

app.UseAuthentication();
app.UseAuthorization();

// --------------------
// Identity Seeding (roles + bootstrap Admin)
// --------------------

await IdentitySeeder.SeedAsync(app.Services, app.Configuration);

// --------------------
// Diagnostic Endpoints
// --------------------

app.MapGet("/", () => "RevArt API is alive");

app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "ok",
        application = "RevArt API",
        environment = app.Environment.EnvironmentName
    });
});

app.MapGet("/routes-test", () => "Routes are working");

// --------------------
// Controllers
// --------------------

app.MapControllers();

// Print discovered endpoints to logs
var endpointDataSource =
    app.Services.GetRequiredService<EndpointDataSource>();

foreach (var endpoint in endpointDataSource.Endpoints)
{
    Console.WriteLine(
        $"REGISTERED ENDPOINT: {endpoint.DisplayName}");
}

app.Run();