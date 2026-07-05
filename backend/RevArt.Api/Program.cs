using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using RevArt.Api.Controllers;
using RevArt.Infrastructure.Data;

using RevArt.Core.Interfaces;
using RevArt.Core.Services;
using RevArt.Infrastructure.Repositories;

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
                "http://localhost:5173",
                "https://lemon-grass-0d3e50a0f.7.azurestaticapps.net",
                "https://revartgarage.com",
                "https://www.revartgarage.com")
            .AllowAnyHeader()
            .AllowAnyMethod();
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
    builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine($"REVART DB CONNECTION = {connectionString}");

builder.Services.AddDbContext<RevArtDbContext>(options =>
    options.UseSqlServer(connectionString));

// --------------------
// Dependency Injection
// --------------------

builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IVehicleService, VehicleService>();

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

app.UseCors("AllowReactDevClient");

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

// Print discovered endpoints to Azure logs
var endpointDataSource = app.Services.GetRequiredService<EndpointDataSource>();

foreach (var endpoint in endpointDataSource.Endpoints)
{
    Console.WriteLine($"REGISTERED ENDPOINT: {endpoint.DisplayName}");
}

app.Run();