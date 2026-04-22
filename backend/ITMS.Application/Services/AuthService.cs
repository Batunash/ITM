using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ITMS.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IRoleService _roleService;

    public AuthService(IUserRepository userRepository, IConfiguration configuration, IRoleService roleService)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _roleService = roleService;
    }

    public LoginResultDto? Login(LoginDto dto)
    {
        var user = _userRepository.GetByEmail(dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        var permissions = _roleService.GetPermissionNamesByRoleName(user.Role.Name);
        var token = GenerateJwtToken(user.Id, user.Email, user.Role.Name, permissions);
        return new LoginResultDto
        {
            Token = token,
            Role = user.Role.Name,
            UserId = user.Id,
            FullName = user.FullName
        };
    }

    public LoginResultDto? Register(RegisterDto dto)
    {
        if (_userRepository.GetByEmail(dto.Email) != null)
            return null;

        var user = new ITMS.Domain.Entities.User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = 1
        };
        _userRepository.Add(user);

        var permissions = _roleService.GetPermissionNamesByRoleName("EndUser");
        var token = GenerateJwtToken(user.Id, user.Email, "EndUser", permissions);
        return new LoginResultDto
        {
            Token = token,
            Role = "EndUser",
            UserId = user.Id,
            FullName = user.FullName
        };
    }

    public string HashPassword(string plainPassword)
        => BCrypt.Net.BCrypt.HashPassword(plainPassword);

    private string GenerateJwtToken(int userId, string email, string role, IEnumerable<string> permissions)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "ITMSDefaultSecretKey2024!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };
        claims.AddRange(permissions.Select(p => new Claim("permission", p)));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ITMS",
            audience: _configuration["Jwt:Audience"] ?? "ITMSUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
