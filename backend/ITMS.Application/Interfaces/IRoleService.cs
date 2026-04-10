using ITMS.Domain.Entities;

namespace ITMS.Application.Interfaces;

public interface IRoleService
{
    List<Role> GetAllRoles();
    List<Permission> GetPermissionsForRole(int roleId);
    void AddPermissionToRole(int roleId, int permissionId);
    void RemovePermissionFromRole(int roleId, int permissionId);
    void AssignRole(int userId, int roleId);
    List<string> GetPermissionNamesByRoleName(string roleName);
}
