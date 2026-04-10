using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "SystemAdmin")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_settingsService.GetSettings());

    [HttpPut]
    public IActionResult Update([FromQuery] string key, [FromQuery] string value)
    {
        _settingsService.UpdateSetting(key, value);
        return NoContent();
    }
}
