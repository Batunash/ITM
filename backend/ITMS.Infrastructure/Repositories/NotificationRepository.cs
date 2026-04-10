using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Infrastructure.Repositories;

public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
{
    public NotificationRepository(AppDbContext context) : base(context) { }

    public List<Notification> GetUnreadByUser(int userId)
        => _context.Notifications
            .Include(n => n.SentBy)
            .Where(n => n.SentToId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToList();
}
