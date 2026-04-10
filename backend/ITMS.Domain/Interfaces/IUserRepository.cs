using ITMS.Domain.Entities;

namespace ITMS.Domain.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    User? GetByEmail(string email);
    List<User> GetByRole(int roleId);
}
