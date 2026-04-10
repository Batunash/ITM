using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class SlaService : ISlaService
{
    private readonly AppDbContext _context;

    public SlaService(AppDbContext context)
    {
        _context = context;
    }

    public bool CheckCompliance(Ticket ticket)
    {
        if (!ticket.ClosedAt.HasValue) return false;
        var sla = _context.SLAs.FirstOrDefault(s => s.PriorityId == ticket.PriorityId);
        if (sla == null) return true;
        var resolutionHours = (ticket.ClosedAt.Value - ticket.CreatedAt).TotalHours;
        return resolutionHours <= sla.TargetResolutionHours;
    }

    public List<Ticket> GetSlaViolations()
    {
        var slas = _context.SLAs.Include(s => s.Priority).ToDictionary(s => s.PriorityId);
        var openTickets = _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Priority)
            .Where(t => !t.ClosedAt.HasValue)
            .ToList();

        return openTickets.Where(t =>
        {
            if (!slas.TryGetValue(t.PriorityId, out var sla)) return false;
            var elapsed = (DateTime.UtcNow - t.CreatedAt).TotalHours;
            return elapsed > sla.TargetResolutionHours;
        }).ToList();
    }
}
