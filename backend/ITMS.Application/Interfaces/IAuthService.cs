using ITMS.Application.DTOs;

namespace ITMS.Application.Interfaces;

public interface IAuthService
{
    LoginResultDto? Login(LoginDto dto);
    LoginResultDto? Register(RegisterDto dto);
    string HashPassword(string plainPassword);
}
