using ITMS.Domain.Entities;

namespace ITMS.Application.Interfaces;

public interface IAuditLogService
{
    void RecordAction(int userId, string action);
    List<AuditLog> GetLogs();
}
