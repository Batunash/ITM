using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public IActionResult GetStats() => Ok(_dashboardService.GetStats());

    [HttpGet("recent-tickets")]
    public IActionResult GetRecentTickets([FromQuery] int limit = 10)
        => Ok(_dashboardService.GetRecentTickets(limit));
}
