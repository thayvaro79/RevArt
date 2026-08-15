using System.Text.Json;
using Azure.Messaging.ServiceBus;

namespace RevArt.Api.Messaging;

public class ImageUploadedMessageSender
{
    private readonly ServiceBusSender _sender;

    public ImageUploadedMessageSender(ServiceBusClient client, IConfiguration configuration)
    {
        var queueName = configuration["ServiceBus:QueueName"]
            ?? throw new InvalidOperationException("ServiceBus queue name is missing.");

        _sender = client.CreateSender(queueName);
    }

    public async Task SendAsync(
        ImageUploadedMessage message,
        CancellationToken cancellationToken = default)
    {
        var json = JsonSerializer.Serialize(message);

        var serviceBusMessage = new ServiceBusMessage(json)
        {
            ContentType = "application/json",
            Subject = "ImageUploaded"
        };

        await _sender.SendMessageAsync(serviceBusMessage, cancellationToken);
    }
}