using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Infrastructure.Repositories;

public class ChangeRequestRepository : GenericRepository<ChangeRequest>, IChangeRequestRepository
{
    public ChangeRequestRepository(AppDbContext context) : base(context) { }

    public List<ChangeRequest> GetByStatus(int statusId)
        => _context.ChangeRequests
            .Include(cr => cr.RequestedBy)
            .Include(cr => cr.Status)
            .Where(cr => cr.StatusId == statusId)
            .ToList();
}
