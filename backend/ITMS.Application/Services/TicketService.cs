using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IAuditLogService _auditLogService;
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _context;

    public TicketService(
        ITicketRepository ticketRepository,
        IAuditLogService auditLogService,
        INotificationService notificationService,
        AppDbContext context)
    {
        _ticketRepository = ticketRepository;
        _auditLogService = auditLogService;
        _notificationService = notificationService;
        _context = context;
    }

    public List<TicketResponseDto> GetAll()
        => _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Priority)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .ToList()
            .Select(MapToDto)
            .ToList();

    public TicketResponseDto? GetById(int id)
    {
        var ticket = _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Priority)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .FirstOrDefault(t => t.Id == id);
        return ticket == null ? null : MapToDto(ticket);
    }

    public List<TicketResponseDto> GetByUserId(int userId)
        => _ticketRepository.GetTicketsByUserId(userId)
            .Select(MapToDto)
            .ToList();

    public TicketResponseDto CreateTicket(CreateTicketDto dto)
    {
        var openStatus = _context.Statuses.First(s => s.Name == "Open");

        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            StatusId = openStatus.Id,
            PriorityId = dto.PriorityId,
            CreatedById = dto.UserId
        };
        _ticketRepository.Add(ticket);
        _auditLogService.RecordAction(dto.UserId, $"Ticket created: {ticket.Title}");

        var created = _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Priority)
            .Include(t => t.CreatedBy)
            .First(t => t.Id == ticket.Id);
        return MapToDto(created);
    }

    public void AssignAgent(int ticketId, AssignAgentDto dto)
    {
        var ticket = _context.Tickets
            .Include(t => t.Status)
            .FirstOrDefault(t => t.Id == ticketId);
        if (ticket == null) return;

        var oldStatusId = ticket.StatusId;
        var assignedStatus = _context.Statuses.First(s => s.Name == "Assigned");

        ticket.AssignedToId = dto.AgentId;
        ticket.StatusId = assignedStatus.Id;
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticketId,
            UpdatedByUserId = dto.ManagerId,
            OldStatusId = oldStatusId,
            NewStatusId = assignedStatus.Id,
            ChangedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();

        _notificationService.Send(dto.ManagerId, dto.AgentId, $"Ticket #{ticketId} has been assigned to you.");
        _auditLogService.RecordAction(dto.ManagerId, $"Ticket #{ticketId} assigned to agent #{dto.AgentId}");
    }

    public void UpdateStatus(int ticketId, int newStatusId)
    {
        var ticket = _context.Tickets.Find(ticketId);
        if (ticket == null) return;

        var oldStatusId = ticket.StatusId;
        ticket.StatusId = newStatusId;
        ticket.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();

        _auditLogService.RecordAction(ticket.CreatedById, $"Ticket #{ticketId} status updated");
    }

    public void UpdatePriority(int ticketId, int priorityId)
    {
        var ticket = _context.Tickets.Find(ticketId);
        if (ticket == null) return;

        ticket.PriorityId = priorityId;
        ticket.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
    }

    public void CloseTicket(int ticketId, CloseTicketDto dto)
    {
        var ticket = _context.Tickets
            .Include(t => t.Status)
            .FirstOrDefault(t => t.Id == ticketId);
        if (ticket == null) return;

        var oldStatusId = ticket.StatusId;
        var closedStatus = _context.Statuses.First(s => s.Name == "Closed");

        ticket.StatusId = closedStatus.Id;
        ticket.ClosedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticketId,
            UpdatedByUserId = dto.ClosedById,
            OldStatusId = oldStatusId,
            NewStatusId = closedStatus.Id,
            ChangedDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();

        _notificationService.Send(dto.ClosedById, ticket.CreatedById, $"Your ticket #{ticketId} has been resolved.");
        _auditLogService.RecordAction(dto.ClosedById, $"Ticket #{ticketId} closed");
    }

    private static TicketResponseDto MapToDto(Ticket t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Status = t.Status?.Name ?? string.Empty,
        Priority = t.Priority?.Name ?? string.Empty,
        CreatedBy = t.CreatedBy?.FullName ?? string.Empty,
        AssignedTo = t.AssignedTo?.FullName,
        CreatedAt = t.CreatedAt,
        ClosedAt = t.ClosedAt
    };
}
