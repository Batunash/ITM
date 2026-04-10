using ITMS.Domain.Entities;

namespace ITMS.Application.Interfaces;

public interface INotificationService
{
    void Send(int senderUserId, int receiverUserId, string message);
    List<Notification> GetUnreadNotifications(int userId);
    void MarkAsRead(int notificationId);
}
