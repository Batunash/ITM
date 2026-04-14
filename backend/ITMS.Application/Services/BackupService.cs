using ITMS.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Diagnostics;

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

        
        var backupDir = Path.Combine(AppContext.BaseDirectory, "backups");
        Directory.CreateDirectory(backupDir);
        var backupPath = Path.Combine(backupDir, backupFileName);

        
        var connectionString = _configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        var parts = connectionString
            .Split(';', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Split('=', 2))
            .Where(p => p.Length == 2)
            .ToDictionary(p => p[0].Trim().ToLower(), p => p[1].Trim(), StringComparer.OrdinalIgnoreCase);

        parts.TryGetValue("host", out var host);
        parts.TryGetValue("port", out var port);
        parts.TryGetValue("database", out var database);
        parts.TryGetValue("username", out var username);
        parts.TryGetValue("password", out var password);

        host ??= "localhost";
        port ??= "5432";

        if (string.IsNullOrEmpty(database) || string.IsNullOrEmpty(username))
            throw new InvalidOperationException("Cannot parse database credentials from connection string.");

        var pgDumpPath = ResolvePgDump();
        var psi = new ProcessStartInfo
        {
            FileName = pgDumpPath,
            Arguments = $"-h {host} -p {port} -U {username} -d {database} -F p -f \"{backupPath}\"",
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        
        if (!string.IsNullOrEmpty(password))
            psi.Environment["PGPASSWORD"] = password;

        using var process = Process.Start(psi)
            ?? throw new InvalidOperationException("Failed to start pg_dump process. Ensure PostgreSQL tools are installed and pg_dump is in PATH.");

        var stderr = process.StandardError.ReadToEnd();
        process.WaitForExit();

        if (process.ExitCode != 0)
            throw new InvalidOperationException($"pg_dump exited with code {process.ExitCode}: {stderr}");

        return backupPath;
    }

    
    
    
    
    private static string ResolvePgDump()
    {
        
        var candidates = new List<string>();
        foreach (var version in new[] { "18", "17", "16", "15", "14", "13", "12" })
        {
            candidates.Add(Path.Combine("C:\\Program Files\\PostgreSQL", version, "bin", "pg_dump.exe"));
            candidates.Add(Path.Combine("C:\\Program Files (x86)\\PostgreSQL", version, "bin", "pg_dump.exe"));
        }

        var found = candidates.FirstOrDefault(File.Exists);
        return found ?? "pg_dump"; 
    }
}
