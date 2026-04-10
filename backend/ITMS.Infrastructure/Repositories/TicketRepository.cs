using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Infrastructure.Repositories;

public class TicketRepository : GenericRepository<Ticket>, ITicketRepository
{
    public TicketRepository(AppDbContext context) : base(context) { }

    public List<Ticket> GetTicketsByUserId(int userId)
        => _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Priority)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Where(t => t.CreatedById == userId)
            .ToList();

    public List<Ticket> GetOpenTickets()
        => _context.Tickets
            .Include(t => t.Status)
            .Include(t => t.Priority)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Where(t => t.Status.Name == "Open")
            .ToList();
}
