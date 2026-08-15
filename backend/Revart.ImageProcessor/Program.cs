using Azure.Messaging.ServiceBus;
using Revart.ImageProcessor;
using Revart.ImageProcessor.Services;

var builder = Host.CreateApplicationBuilder(args);

var serviceBusConnectionString =
    builder.Configuration["ServiceBus:ConnectionString"]
    ?? throw new InvalidOperationException(
        "Service Bus connection string is missing.");

builder.Services.AddSingleton(
    new ServiceBusClient(serviceBusConnectionString));

builder.Services.AddSingleton<BlobImageService>();

builder.Services.AddHostedService<Worker>();

var host = builder.Build();

host.Run();