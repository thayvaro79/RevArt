using System.Text.Json;
using Azure.Messaging.ServiceBus;
using Revart.ImageProcessor.Messaging;
using Revart.ImageProcessor.Services;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;

namespace Revart.ImageProcessor;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly ServiceBusProcessor _processor;
    private readonly BlobImageService _blobImageService;

    public Worker(
        ILogger<Worker> logger,
        ServiceBusClient serviceBusClient,
        IConfiguration configuration,
        BlobImageService blobImageService)
    {
        _logger = logger;
        _blobImageService = blobImageService;

        var queueName = configuration["ServiceBus:QueueName"]
            ?? throw new InvalidOperationException(
                "Service Bus queue name is missing.");

        _processor = serviceBusClient.CreateProcessor(
            queueName,
            new ServiceBusProcessorOptions());
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        _processor.ProcessMessageAsync += ProcessMessageAsync;
        _processor.ProcessErrorAsync += ProcessErrorAsync;

        await _processor.StartProcessingAsync(stoppingToken);

        _logger.LogInformation(
            "Image Processor is listening for Service Bus messages.");

        try
        {
            await Task.Delay(
                Timeout.Infinite,
                stoppingToken);
        }
        catch (OperationCanceledException)
        {
        }

        await _processor.StopProcessingAsync();
    }

    private async Task ProcessMessageAsync(
        ProcessMessageEventArgs args)
    {
        var messageBody = args.Message.Body.ToString();

        var message =
            JsonSerializer.Deserialize<ImageUploadedMessage>(messageBody);

        if (message == null)
        {
            throw new InvalidOperationException(
                "Unable to deserialize ImageUploaded message.");
        }

        _logger.LogInformation(
            "Processing blob: {BlobName}",
            message.BlobName);

        await using var originalStream =
            await _blobImageService.DownloadAsync(
                message.BlobName,
                args.CancellationToken);

        _logger.LogInformation(
            "Downloaded blob successfully. Size: {Length} bytes",
            originalStream.Length);

        using var image = await Image.LoadAsync(
            originalStream,
            args.CancellationToken);

        var fileName = Path.GetFileName(message.BlobName);

        var thumbnailBlobName =
            message.BlobName.Replace(
                "/original/",
                "/thumbnail/");

        var mediumBlobName =
            message.BlobName.Replace(
                "/original/",
                "/medium/");

        using var thumbnailImage = image.Clone(ctx =>
            ctx.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(400, 400)
            }));

        await using var thumbnailStream = new MemoryStream();

        await thumbnailImage.SaveAsync(
            thumbnailStream,
            new PngEncoder(),
            args.CancellationToken);

        await _blobImageService.UploadAsync(
            thumbnailBlobName,
            thumbnailStream,
            "image/png",
            args.CancellationToken);

        _logger.LogInformation(
            "Thumbnail uploaded: {BlobName}",
            thumbnailBlobName);

        using var mediumImage = image.Clone(ctx =>
            ctx.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(1200, 1200)
            }));

        await using var mediumStream = new MemoryStream();

        await mediumImage.SaveAsync(
            mediumStream,
            new PngEncoder(),
            args.CancellationToken);

        await _blobImageService.UploadAsync(
            mediumBlobName,
            mediumStream,
            "image/png",
            args.CancellationToken);

        _logger.LogInformation(
            "Medium image uploaded: {BlobName}",
            mediumBlobName);

        await args.CompleteMessageAsync(args.Message);

        _logger.LogInformation(
            "Image processing completed for VehiclePhotoId {VehiclePhotoId}",
            message.VehiclePhotoId);
    }

    private Task ProcessErrorAsync(
        ProcessErrorEventArgs args)
    {
        _logger.LogError(
            args.Exception,
            "Service Bus processing error.");

        return Task.CompletedTask;
    }
}