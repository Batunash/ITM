using ITMS.Domain.Entities;

namespace ITMS.Domain.Interfaces;

public interface IChangeRequestRepository : IGenericRepository<ChangeRequest>
{
    List<ChangeRequest> GetByStatus(int statusId);
}
