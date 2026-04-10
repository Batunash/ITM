using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "SystemAdmin")]
public class RoleController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_roleService.GetAllRoles());

    [HttpGet("{id}/permissions")]
    public IActionResult GetPermissions(int id)
        => Ok(_roleService.GetPermissionsForRole(id));

    [HttpPost("{id}/permissions/{permissionId}")]
    public IActionResult AddPermission(int id, int permissionId)
    {
        _roleService.AddPermissionToRole(id, permissionId);
        return NoContent();
    }

    [HttpPut("assign")]
    public IActionResult AssignRole([FromQuery] int userId, [FromQuery] int roleId)
    {
        _roleService.AssignRole(userId, roleId);
        return NoContent();
    }
}
