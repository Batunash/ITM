using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public DashboardStatsDto GetStats()
    {
        var openTickets = _context.Tickets
            .Include(t => t.Status)
            .Count(t => t.Status.Name != "Closed");

        var pendingAssets = _context.Assets
            .Include(a => a.Status)
            .Count(a => a.Status.Name == "Maintenance");

        var agentRoleId = _context.Roles.First(r => r.Name == "ITSupportAgent").Id;
        var activeAgents = _context.Users.Count(u => u.RoleId == agentRoleId);

        var ticketsByStatus = _context.Tickets
            .Include(t => t.Status)
            .GroupBy(t => t.Status.Name)
            .Select(g => new StatusCountDto { Status = g.Key, Count = g.Count() })
            .ToList();

        var ticketsByPriority = _context.Tickets
            .Include(t => t.Priority)
            .GroupBy(t => t.Priority.Name)
            .Select(g => new PriorityCountDto { Priority = g.Key, Count = g.Count() })
            .ToList();

        return new DashboardStatsDto
        {
            OpenTickets = openTickets,
            PendingAssets = pendingAssets,
            ActiveAgents = activeAgents,
            TicketsByStatus = ticketsByStatus,
            TicketsByPriority = ticketsByPriority
        };
    }

    public List<TicketResponseDto> GetRecentTickets(int limit)
        => _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Priority)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToList()
            .Select(t => new TicketResponseDto
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
            })
            .ToList();
}
