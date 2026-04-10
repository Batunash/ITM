using ITMS.Application.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public object GetTicketResolutionStats()
    {
        var closedTickets = _context.Tickets
            .Include(t => t.Priority)
            .Where(t => t.ClosedAt.HasValue)
            .ToList();

        return closedTickets.Select(t => new
        {
            t.Id,
            t.Title,
            Priority = t.Priority.Name,
            CreatedAt = t.CreatedAt,
            ClosedAt = t.ClosedAt,
            ResolutionHours = (t.ClosedAt!.Value - t.CreatedAt).TotalHours
        });
    }

    public object GetSLAComplianceReport()
    {
        var slas = _context.SLAs.Include(s => s.Priority).ToList();
        var closedTickets = _context.Tickets
            .Include(t => t.Priority)
            .Where(t => t.ClosedAt.HasValue)
            .ToList();

        return closedTickets.Select(t =>
        {
            var sla = slas.FirstOrDefault(s => s.PriorityId == t.PriorityId);
            var resHours = (t.ClosedAt!.Value - t.CreatedAt).TotalHours;
            return new
            {
                t.Id,
                t.Title,
                Priority = t.Priority.Name,
                ResolutionHours = resHours,
                TargetHours = sla?.TargetResolutionHours,
                IsCompliant = sla != null && resHours <= sla.TargetResolutionHours
            };
        });
    }

    public object GetAgentPerformanceReport()
    {
        return _context.Tickets
            .Include(t => t.AssignedTo)
            .Where(t => t.AssignedToId.HasValue && t.ClosedAt.HasValue)
            .GroupBy(t => t.AssignedTo!.FullName)
            .Select(g => new
            {
                Agent = g.Key,
                ClosedTickets = g.Count(),
                AvgResolutionHours = g.Average(t => (t.ClosedAt!.Value - t.CreatedAt).TotalHours)
            })
            .ToList();
    }
}
