using ITMS.Application.DTOs;

namespace ITMS.Application.Interfaces;

public interface IUserService
{
    List<UserResponseDto> GetAllUsers();
    UserResponseDto? GetUserById(int id);
    UserResponseDto CreateUser(CreateUserDto dto);
    UserResponseDto? UpdateUser(int id, UpdateUserDto dto);
    void DeleteUser(int id);
}
