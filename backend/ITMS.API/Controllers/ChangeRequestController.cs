using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/change-requests")]
[Authorize]
public class ChangeRequestController : ControllerBase
{
    private readonly IChangeRequestService _changeRequestService;

    public ChangeRequestController(IChangeRequestService changeRequestService)
    {
        _changeRequestService = changeRequestService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_changeRequestService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var cr = _changeRequestService.GetById(id);
        return cr == null ? NotFound() : Ok(cr);
    }

    [HttpPost]
    public IActionResult Submit([FromBody] CreateChangeRequestDto dto)
        => Ok(_changeRequestService.SubmitRequest(dto));

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "ITManager,SystemAdmin")]
    public IActionResult Approve(int id)
    {
        _changeRequestService.Approve(id);
        return NoContent();
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "ITManager,SystemAdmin")]
    public IActionResult Reject(int id)
    {
        _changeRequestService.Reject(id);
        return NoContent();
    }
}
