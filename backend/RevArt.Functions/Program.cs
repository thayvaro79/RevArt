using Microsoft.Extensions.Configuration;
using Azure.Monitor.OpenTelemetry.Exporter;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Azure.Functions.Worker.OpenTelemetry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenTelemetry;
using RevArt.Infrastructure.Data;



var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddOpenTelemetry()
    .UseFunctionsWorkerDefaults();

var connectionString =
    builder.Configuration["SqlConnectionString"]
    ?? throw new InvalidOperationException(
        "SqlConnectionString was not found.");

builder.Services.AddDbContext<RevArtDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Build().Run();