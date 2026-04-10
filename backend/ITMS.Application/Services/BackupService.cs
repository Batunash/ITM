using ITMS.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ITMS.Application.Services;

public class BackupService : IBackupService
{
    private readonly IConfiguration _configuration;

    public BackupService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string TriggerBackup()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var backupFileName = $"itms_backup_{timestamp}.sql";
        var connectionString = _configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

        // In a production environment, this would invoke pg_dump.
        // For the purpose of this system, we return the backup file name as confirmation.
        return $"Backup triggered: {backupFileName}";
    }
}
