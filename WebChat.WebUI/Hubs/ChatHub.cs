using Microsoft.AspNetCore.SignalR;

namespace WebChat.WebUI.Hubs;

public class ChatHub : Hub
{
    private static Dictionary<string, string> connectedClients = new();

    // This method will send notifications to all clients
    // if client have to communicate, we will call SendMessage() method.
    // if client have to receive from server, we will use ReceiveChatMessage method.
    public async Task SendMessage(string user, string message, DateTime sentAt)
    {
        await Clients.All.SendAsync("ReceiveChatMessage", user, message, sentAt);
    }

    // Everyone will be notified except who have joined the chat.
    public async Task JoinChat(string user, string message, DateTime sentAt)
    {
        connectedClients[Context.ConnectionId] = user;
        await Clients.Others.SendAsync("ReceiveChatMessage", user, message, sentAt);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await LeaveChat();
        await base.OnDisconnectedAsync(exception); 
    }

    private async Task LeaveChat()
    {
        if (connectedClients.TryGetValue(Context.ConnectionId, out string user))
        {
            var message = $"{user} has left the chat.";
            await Clients.Others.SendAsync("ReceiveChatMessage", user, message, DateTime.Now);
        }
    }
}
