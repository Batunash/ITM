using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = "ITManager,SystemAdmin")]
    public IActionResult GetAll() => Ok(_userService.GetAllUsers());

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var user = _userService.GetUserById(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost]
    [Authorize(Roles = "SystemAdmin")]
    public IActionResult Create([FromBody] CreateUserDto dto)
        => Ok(_userService.CreateUser(dto));

    [HttpPut("{id}")]
    [Authorize(Roles = "SystemAdmin")]
    public IActionResult Update(int id, [FromBody] UpdateUserDto dto)
    {
        var result = _userService.UpdateUser(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemAdmin")]
    public IActionResult Delete(int id)
    {
        _userService.DeleteUser(id);
        return NoContent();
    }
}
