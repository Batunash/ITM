using ITMS.Domain.Entities;

namespace ITMS.Domain.Interfaces;

public interface IAuditLogRepository : IGenericRepository<AuditLog>
{
    List<AuditLog> GetLogsByUser(int userId);
}
