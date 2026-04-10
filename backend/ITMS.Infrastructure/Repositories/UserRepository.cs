using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public override List<User> GetAll()
        => _context.Users
            .Include(u => u.Role)
            .ToList();

    public override User? GetById(int id)
        => _context.Users
            .Include(u => u.Role)
            .FirstOrDefault(u => u.Id == id);

    public User? GetByEmail(string email)
        => _context.Users
            .Include(u => u.Role)
            .FirstOrDefault(u => u.Email == email);

    public List<User> GetByRole(int roleId)
        => _context.Users
            .Include(u => u.Role)
            .Where(u => u.RoleId == roleId)
            .ToList();
}
