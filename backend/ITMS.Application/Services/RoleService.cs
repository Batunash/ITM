using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class RoleService : IRoleService
{
    private readonly AppDbContext _context;

    public RoleService(AppDbContext context)
    {
        _context = context;
    }

    public List<Role> GetAllRoles() => _context.Roles.ToList();

    public List<Permission> GetPermissionsForRole(int roleId)
        => _context.RolePermissions
            .Include(rp => rp.Permission)
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.Permission)
            .ToList();

    public void AddPermissionToRole(int roleId, int permissionId)
    {
        var exists = _context.RolePermissions
            .Any(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);
        if (exists) return;

        _context.RolePermissions.Add(new RolePermission
        {
            RoleId = roleId,
            PermissionId = permissionId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();
    }

    public void AssignRole(int userId, int roleId)
    {
        var user = _context.Users.Find(userId);
        if (user == null) return;
        user.RoleId = roleId;
        user.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
    }
}
