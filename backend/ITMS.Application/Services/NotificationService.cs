using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;

namespace ITMS.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public void Send(int senderUserId, int receiverUserId, string message)
    {
        var notification = new Notification
        {
            SentById = senderUserId,
            SentToId = receiverUserId,
            Message = message,
            IsRead = false
        };
        _notificationRepository.Add(notification);
    }

    public List<Notification> GetUnreadNotifications(int userId)
        => _notificationRepository.GetUnreadByUser(userId);

    public void MarkAsRead(int notificationId)
    {
        var notification = _notificationRepository.GetById(notificationId);
        if (notification == null) return;
        notification.IsRead = true;
        _notificationRepository.Update(notification);
    }
}
