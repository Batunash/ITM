using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/sla")]
[Authorize(Roles = "ITManager,SystemAdmin")]
public class SlaController : ControllerBase
{
    private readonly ISlaService _slaService;

    public SlaController(ISlaService slaService)
    {
        _slaService = slaService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_slaService.GetAll());

    [HttpGet("violations")]
    public IActionResult GetViolations() => Ok(_slaService.GetViolationDtos());
}
