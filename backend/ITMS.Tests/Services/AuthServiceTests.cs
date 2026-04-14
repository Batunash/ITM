using ITMS.Application.DTOs;
using ITMS.Application.Services;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Moq;

namespace ITMS.Tests.Services;

public class AuthServiceTests
{
    private IConfiguration BuildConfig()
    {
        var dict = new Dictionary<string, string?>
        {
            { "Jwt:Key", "ITMSSecretKey2024!SuperSecure@SENG321" },
            { "Jwt:Issuer", "ITMS" },
            { "Jwt:Audience", "ITMSUsers" }
        };
        return new ConfigurationBuilder().AddInMemoryCollection(dict).Build();
    }

    [Fact]
    public void Login_WithValidCredentials_ShouldReturnToken()
    {
        
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var fakeUser = new User
        {
            Id = 1,
            FullName = "Admin User",
            Email = "admin@itms.com",
            PasswordHash = passwordHash,
            Role = new Role { Id = 1, Name = "SystemAdmin" },
            RoleId = 1
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("admin@itms.com")).Returns(fakeUser);

        var service = new AuthService(userRepo.Object, BuildConfig());

        
        var result = service.Login(new LoginDto { Email = "admin@itms.com", Password = "Password123!" });

        
        Assert.NotNull(result);
        Assert.False(string.IsNullOrEmpty(result.Token));
        Assert.Equal("SystemAdmin", result.Role);
        Assert.Equal(1, result.UserId);
        Assert.Equal("Admin User", result.FullName);
    }

    [Fact]
    public void Login_WithInvalidPassword_ShouldReturnNull()
    {
        
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var fakeUser = new User
        {
            Id = 1,
            FullName = "Admin User",
            Email = "admin@itms.com",
            PasswordHash = passwordHash,
            Role = new Role { Id = 1, Name = "SystemAdmin" },
            RoleId = 1
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("admin@itms.com")).Returns(fakeUser);

        var service = new AuthService(userRepo.Object, BuildConfig());

        
        var result = service.Login(new LoginDto { Email = "admin@itms.com", Password = "WrongPassword!" });

        
        Assert.Null(result);
    }

    [Fact]
    public void Login_WithNonExistentEmail_ShouldReturnNull()
    {
        
        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail(It.IsAny<string>())).Returns((User?)null);

        var service = new AuthService(userRepo.Object, BuildConfig());

        
        var result = service.Login(new LoginDto { Email = "nobody@itms.com", Password = "Password123!" });

        
        Assert.Null(result);
    }

    [Fact]
    public void Login_WithValidCredentials_TokenShouldContainRoleClaim()
    {
        
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Pass!");
        var fakeUser = new User
        {
            Id = 2,
            FullName = "IT Agent",
            Email = "agent@itms.com",
            PasswordHash = passwordHash,
            Role = new Role { Id = 2, Name = "ITSupportAgent" },
            RoleId = 2
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("agent@itms.com")).Returns(fakeUser);

        var service = new AuthService(userRepo.Object, BuildConfig());

        
        var result = service.Login(new LoginDto { Email = "agent@itms.com", Password = "Pass!" });

        
        Assert.NotNull(result);
        Assert.Equal("ITSupportAgent", result.Role);
        
        Assert.Equal(3, result.Token.Split('.').Length);
    }
}
