using System.Security.Claims;
using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IRoleService _roleService;

    public AuthController(IAuthService authService, IRoleService roleService)
    {
        _authService = authService;
        _roleService = roleService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        var result = _authService.Login(dto);
        if (result == null)
            return Unauthorized(new { message = "Invalid email or password." });
        return Ok(result);
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto dto)
    {
        var result = _authService.Register(dto);
        if (result == null)
            return Conflict(new { message = "An account with this email already exists." });
        return Ok(result);
    }

    
    [HttpGet("permissions")]
    [Authorize]
    public IActionResult GetMyPermissions()
    {
        var roleName = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var permissions = _roleService.GetPermissionNamesByRoleName(roleName);
        return Ok(permissions);
    }
}
