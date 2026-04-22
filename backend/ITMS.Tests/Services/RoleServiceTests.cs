using ITMS.Application.Services;
using ITMS.Domain.Entities;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Tests.Services;

public class RoleServiceTests
{
    private AppDbContext BuildDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        var ctx = new AppDbContext(options);

        ctx.Roles.AddRange(
            new Role { Id = 1, Name = "EndUser" },
            new Role { Id = 2, Name = "ITSupportAgent" },
            new Role { Id = 3, Name = "ITManager" },
            new Role { Id = 4, Name = "SystemAdmin" }
        );
        ctx.Permissions.AddRange(
            new Permission { Id = 1, Name = "ViewTickets" },
            new Permission { Id = 2, Name = "CreateTicket" },
            new Permission { Id = 3, Name = "AssignTicket" },
            new Permission { Id = 4, Name = "CloseTicket" },
            new Permission { Id = 5, Name = "ManageUsers" },
            new Permission { Id = 6, Name = "ManageAssets" },
            new Permission { Id = 7, Name = "ViewReports" },
            new Permission { Id = 8, Name = "ViewAuditLogs" },
            new Permission { Id = 9, Name = "ManageSettings" }
        );
        ctx.RolePermissions.AddRange(
            new RolePermission { Id = 1, RoleId = 1, PermissionId = 1 }, // EndUser -> ViewTickets
            new RolePermission { Id = 2, RoleId = 1, PermissionId = 2 }, // EndUser -> CreateTicket
            new RolePermission { Id = 3, RoleId = 2, PermissionId = 1 }, // ITSupportAgent -> ViewTickets
            new RolePermission { Id = 4, RoleId = 2, PermissionId = 4 }, // ITSupportAgent -> CloseTicket
            new RolePermission { Id = 5, RoleId = 4, PermissionId = 1 }, // SystemAdmin -> ViewTickets
            new RolePermission { Id = 6, RoleId = 4, PermissionId = 9 }  // SystemAdmin -> ManageSettings
        );
        ctx.SaveChanges();
        return ctx;
    }

    [Fact]
    public void GetPermissionNamesByRoleName_ShouldReturnCorrectPermissions()
    {
        using var ctx = BuildDb(nameof(GetPermissionNamesByRoleName_ShouldReturnCorrectPermissions));
        var service = new RoleService(ctx);

        var result = service.GetPermissionNamesByRoleName("EndUser");

        Assert.Equal(2, result.Count);
        Assert.Contains("ViewTickets", result);
        Assert.Contains("CreateTicket", result);
        Assert.DoesNotContain("ManageUsers", result);
    }

    [Fact]
    public void GetPermissionNamesByRoleName_ForAgentRole_ShouldReturnAgentPermissions()
    {
        using var ctx = BuildDb(nameof(GetPermissionNamesByRoleName_ForAgentRole_ShouldReturnAgentPermissions));
        var service = new RoleService(ctx);

        var result = service.GetPermissionNamesByRoleName("ITSupportAgent");

        Assert.Equal(2, result.Count);
        Assert.Contains("ViewTickets", result);
        Assert.Contains("CloseTicket", result);
        Assert.DoesNotContain("AssignTicket", result);
        Assert.DoesNotContain("ManageUsers", result);
    }

    [Fact]
    public void GetPermissionNamesByRoleName_ForUnknownRole_ShouldReturnEmpty()
    {
        using var ctx = BuildDb(nameof(GetPermissionNamesByRoleName_ForUnknownRole_ShouldReturnEmpty));
        var service = new RoleService(ctx);

        var result = service.GetPermissionNamesByRoleName("GhostRole");

        Assert.Empty(result);
    }

    [Fact]
    public void GetPermissionsForRole_ShouldReturnPermissionEntities()
    {
        using var ctx = BuildDb(nameof(GetPermissionsForRole_ShouldReturnPermissionEntities));
        var service = new RoleService(ctx);

        var result = service.GetPermissionsForRole(roleId: 1);

        Assert.Equal(2, result.Count);
        Assert.All(result, p => Assert.NotNull(p.Name));
    }

    [Fact]
    public void AddPermissionToRole_ShouldCreateMapping()
    {
        using var ctx = BuildDb(nameof(AddPermissionToRole_ShouldCreateMapping));
        var service = new RoleService(ctx);

        service.AddPermissionToRole(roleId: 2, permissionId: 3); // ITSupportAgent -> AssignTicket

        var names = service.GetPermissionNamesByRoleName("ITSupportAgent");
        Assert.Contains("AssignTicket", names);
    }

    [Fact]
    public void AddPermissionToRole_WhenAlreadyExists_ShouldNotDuplicate()
    {
        using var ctx = BuildDb(nameof(AddPermissionToRole_WhenAlreadyExists_ShouldNotDuplicate));
        var service = new RoleService(ctx);

        // EndUser already has ViewTickets (permissionId=1)
        service.AddPermissionToRole(roleId: 1, permissionId: 1);
        service.AddPermissionToRole(roleId: 1, permissionId: 1);

        var names = service.GetPermissionNamesByRoleName("EndUser");
        Assert.Single(names.Where(n => n == "ViewTickets"));
    }

    [Fact]
    public void RemovePermissionFromRole_ShouldDeleteMapping()
    {
        using var ctx = BuildDb(nameof(RemovePermissionFromRole_ShouldDeleteMapping));
        var service = new RoleService(ctx);

        service.RemovePermissionFromRole(roleId: 1, permissionId: 2); // remove CreateTicket from EndUser

        var names = service.GetPermissionNamesByRoleName("EndUser");
        Assert.DoesNotContain("CreateTicket", names);
        Assert.Contains("ViewTickets", names);
    }

    [Fact]
    public void RemovePermissionFromRole_WhenMappingDoesNotExist_ShouldNotThrow()
    {
        using var ctx = BuildDb(nameof(RemovePermissionFromRole_WhenMappingDoesNotExist_ShouldNotThrow));
        var service = new RoleService(ctx);

        var ex = Record.Exception(() => service.RemovePermissionFromRole(roleId: 1, permissionId: 99));

        Assert.Null(ex);
    }

    [Fact]
    public void AssignRole_ShouldUpdateUserRoleId()
    {
        using var ctx = BuildDb(nameof(AssignRole_ShouldUpdateUserRoleId));
        ctx.Users.Add(new User { Id = 10, FullName = "Test", Email = "t@t.com", PasswordHash = "x", RoleId = 1 });
        ctx.SaveChanges();

        var service = new RoleService(ctx);
        service.AssignRole(userId: 10, roleId: 3); // promote to ITManager

        var updated = ctx.Users.Find(10);
        Assert.Equal(3, updated!.RoleId);
    }

    [Fact]
    public void AssignRole_WhenUserNotFound_ShouldNotThrow()
    {
        using var ctx = BuildDb(nameof(AssignRole_WhenUserNotFound_ShouldNotThrow));
        var service = new RoleService(ctx);

        var ex = Record.Exception(() => service.AssignRole(userId: 9999, roleId: 1));

        Assert.Null(ex);
    }

    [Fact]
    public void GetAllRoles_ShouldReturnAllFourRoles()
    {
        using var ctx = BuildDb(nameof(GetAllRoles_ShouldReturnAllFourRoles));
        var service = new RoleService(ctx);

        var roles = service.GetAllRoles();

        Assert.Equal(4, roles.Count);
        Assert.Contains(roles, r => r.Name == "SystemAdmin");
        Assert.Contains(roles, r => r.Name == "EndUser");
    }

    // --- Permission-based authorization integration: verify permission-to-role mappings are dynamic ---

    [Fact]
    public void AddThenRemovePermission_ShouldReflectDynamicChanges()
    {
        using var ctx = BuildDb(nameof(AddThenRemovePermission_ShouldReflectDynamicChanges));
        var service = new RoleService(ctx);

        // ITSupportAgent initially has ViewTickets + CloseTicket
        service.AddPermissionToRole(roleId: 2, permissionId: 5); // grant ManageUsers
        var afterAdd = service.GetPermissionNamesByRoleName("ITSupportAgent");
        Assert.Contains("ManageUsers", afterAdd);

        service.RemovePermissionFromRole(roleId: 2, permissionId: 5); // revoke ManageUsers
        var afterRemove = service.GetPermissionNamesByRoleName("ITSupportAgent");
        Assert.DoesNotContain("ManageUsers", afterRemove);
    }
}
