using ITMS.Domain.Entities;

namespace ITMS.Domain.Interfaces;

public interface ITicketRepository : IGenericRepository<Ticket>
{
    List<Ticket> GetTicketsByUserId(int userId);
    List<Ticket> GetOpenTickets();
}
