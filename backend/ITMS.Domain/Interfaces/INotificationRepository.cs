using ITMS.Domain.Entities;

namespace ITMS.Domain.Interfaces;

public interface INotificationRepository : IGenericRepository<Notification>
{
    List<Notification> GetUnreadByUser(int userId);
}
