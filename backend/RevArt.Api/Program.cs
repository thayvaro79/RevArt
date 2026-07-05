using Microsoft.EntityFrameworkCore;
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

builder.Services.AddControllers();
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

// Leave Swagger enabled for now while we are deploying.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowReactDevClient");

app.MapControllers();

app.Run();