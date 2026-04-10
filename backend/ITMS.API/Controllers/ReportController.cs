using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "ITManager,SystemAdmin")]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ISlaService _slaService;

    public ReportController(IReportService reportService, ISlaService slaService)
    {
        _reportService = reportService;
        _slaService = slaService;
    }

    [HttpGet("tickets")]
    public IActionResult GetTicketStats()
        => Ok(_reportService.GetTicketResolutionStats());

    [HttpGet("sla")]
    public IActionResult GetSlaReport()
        => Ok(_reportService.GetSLAComplianceReport());

    [HttpGet("agents")]
    public IActionResult GetAgentPerformance()
        => Ok(_reportService.GetAgentPerformanceReport());

    [HttpGet("sla-violations")]
    public IActionResult GetSlaViolations()
        => Ok(_slaService.GetSlaViolations());
}
