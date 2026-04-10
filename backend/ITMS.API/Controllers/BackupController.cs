using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/backup")]
[Authorize(Roles = "SystemAdmin")]
public class BackupController : ControllerBase
{
    private readonly IBackupService _backupService;

    public BackupController(IBackupService backupService)
    {
        _backupService = backupService;
    }

    [HttpPost("trigger")]
    public IActionResult Trigger()
    {
        try
        {
            var filePath = _backupService.TriggerBackup();
            return Ok(new { success = true, filePath, message = $"Backup saved to: {filePath}" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
