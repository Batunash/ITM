using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;

namespace ITMS.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogService _auditLogService;

    public UserService(IUserRepository userRepository, IAuditLogService auditLogService)
    {
        _userRepository = userRepository;
        _auditLogService = auditLogService;
    }

    public List<UserResponseDto> GetAllUsers()
        => _userRepository.GetAll()
            .Select(MapToDto)
            .ToList();

    public UserResponseDto? GetUserById(int id)
    {
        var user = _userRepository.GetById(id);
        return user == null ? null : MapToDto(user);
    }

    public UserResponseDto CreateUser(CreateUserDto dto)
    {
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = dto.RoleId
        };
        _userRepository.Add(user);
        _auditLogService.RecordAction(user.Id, $"User created: {user.Email}");
        return MapToDto(user);
    }

    public UserResponseDto? UpdateUser(int id, UpdateUserDto dto)
    {
        var user = _userRepository.GetById(id);
        if (user == null) return null;

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.RoleId = dto.RoleId;
        _userRepository.Update(user);
        _auditLogService.RecordAction(id, $"User updated: {user.Email}");
        return MapToDto(user);
    }

    public void DeleteUser(int id)
    {
        _auditLogService.RecordAction(id, $"User deleted: {id}");
        _userRepository.Delete(id);
    }

    private static UserResponseDto MapToDto(User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Role = u.Role?.Name ?? string.Empty,
        CreatedAt = u.CreatedAt
    };
}
