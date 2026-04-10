using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;

namespace ITMS.Application.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _auditLogRepository;

    public AuditLogService(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public void RecordAction(int userId, string action)
    {
        _auditLogRepository.Add(new AuditLog
        {
            UserId = userId > 0 ? userId : 1,
            Action = action
        });
    }

    public List<AuditLog> GetLogs()
        => _auditLogRepository.GetAll()
            .OrderByDescending(l => l.CreatedAt)
            .ToList();
}
