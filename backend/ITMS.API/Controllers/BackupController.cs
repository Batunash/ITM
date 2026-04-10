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
        var result = _backupService.TriggerBackup();
        return Ok(new { message = result });
    }
}
