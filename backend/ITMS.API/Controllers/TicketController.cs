using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_ticketService.GetAll());

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var ticket = _ticketService.GetById(id);
        return ticket == null ? NotFound() : Ok(ticket);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUser(int userId)
        => Ok(_ticketService.GetByUserId(userId));

    [HttpPost]
    public IActionResult Create([FromBody] CreateTicketDto dto)
        => Ok(_ticketService.CreateTicket(dto));

    [HttpPost("{id}/assign")]
    [Authorize(Roles = "ITManager,SystemAdmin")]
    public IActionResult Assign(int id, [FromBody] AssignAgentDto dto)
    {
        _ticketService.AssignAgent(id, dto);
        return NoContent();
    }

    [HttpPost("{id}/close")]
    [Authorize(Roles = "ITSupportAgent,ITManager,SystemAdmin")]
    public IActionResult Close(int id, [FromBody] CloseTicketDto dto)
    {
        _ticketService.CloseTicket(id, dto);
        return NoContent();
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdateStatus(int id, [FromQuery] int statusId)
    {
        _ticketService.UpdateStatus(id, statusId);
        return NoContent();
    }

    [HttpPut("{id}/priority")]
    [Authorize(Roles = "ITManager,SystemAdmin")]
    public IActionResult UpdatePriority(int id, [FromQuery] int priorityId)
    {
        _ticketService.UpdatePriority(id, priorityId);
        return NoContent();
    }
}
