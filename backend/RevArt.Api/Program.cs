using Azure.Messaging.ServiceBus;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using RevArt.Api.Controllers;
using RevArt.Api.Messaging;
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

// Print discovered endpoints to logs
var endpointDataSource =
    app.Services.GetRequiredService<EndpointDataSource>();

foreach (var endpoint in endpointDataSource.Endpoints)
{
    Console.WriteLine(
        $"REGISTERED ENDPOINT: {endpoint.DisplayName}");
}

app.Run();