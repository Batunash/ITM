using System.IdentityModel.Tokens.Jwt;
using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
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

    private Mock<IRoleService> BuildRoleServiceMock(string roleName, List<string> permissions)
    {
        var mock = new Mock<IRoleService>();
        mock.Setup(r => r.GetPermissionNamesByRoleName(roleName)).Returns(permissions);
        return mock;
    }

    [Fact]
    public void Login_WithValidCredentials_ShouldReturnToken()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
        var fakeUser = new User
        {
            Id = 1, FullName = "Admin User", Email = "admin@itms.com",
            PasswordHash = passwordHash,
            Role = new Role { Id = 4, Name = "SystemAdmin" }, RoleId = 4
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("admin@itms.com")).Returns(fakeUser);

        var roleService = BuildRoleServiceMock("SystemAdmin", ["ViewTickets", "ManageUsers", "ManageSettings"]);
        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

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
            Id = 1, Email = "admin@itms.com", PasswordHash = passwordHash,
            Role = new Role { Name = "SystemAdmin" }, RoleId = 4
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("admin@itms.com")).Returns(fakeUser);

        var roleService = new Mock<IRoleService>();
        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

        var result = service.Login(new LoginDto { Email = "admin@itms.com", Password = "WrongPassword!" });

        Assert.Null(result);
    }

    [Fact]
    public void Login_WithNonExistentEmail_ShouldReturnNull()
    {
        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail(It.IsAny<string>())).Returns((User?)null);

        var roleService = new Mock<IRoleService>();
        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

        var result = service.Login(new LoginDto { Email = "nobody@itms.com", Password = "Password123!" });

        Assert.Null(result);
    }

    [Fact]
    public void Login_WithValidCredentials_TokenShouldContainRoleClaim()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Pass!");
        var fakeUser = new User
        {
            Id = 2, FullName = "IT Agent", Email = "agent@itms.com",
            PasswordHash = passwordHash,
            Role = new Role { Id = 2, Name = "ITSupportAgent" }, RoleId = 2
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("agent@itms.com")).Returns(fakeUser);

        var roleService = BuildRoleServiceMock("ITSupportAgent", ["ViewTickets", "CloseTicket"]);
        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

        var result = service.Login(new LoginDto { Email = "agent@itms.com", Password = "Pass!" });

        Assert.NotNull(result);
        Assert.Equal("ITSupportAgent", result.Role);
        Assert.Equal(3, result.Token.Split('.').Length);
    }

    [Fact]
    public void Login_ShouldEmbedPermissionClaimsInJwt()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Pass!");
        var fakeUser = new User
        {
            Id = 3, Email = "manager@itms.com", PasswordHash = passwordHash,
            Role = new Role { Id = 3, Name = "ITManager" }, RoleId = 3
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("manager@itms.com")).Returns(fakeUser);

        var permissions = new List<string> { "ViewTickets", "AssignTicket", "ManageAssets", "ViewReports" };
        var roleService = BuildRoleServiceMock("ITManager", permissions);
        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

        var result = service.Login(new LoginDto { Email = "manager@itms.com", Password = "Pass!" });

        Assert.NotNull(result);
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(result.Token);
        var tokenPermissions = jwt.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToList();

        Assert.Equal(4, tokenPermissions.Count);
        Assert.Contains("ViewTickets", tokenPermissions);
        Assert.Contains("AssignTicket", tokenPermissions);
        Assert.Contains("ManageAssets", tokenPermissions);
        Assert.Contains("ViewReports", tokenPermissions);
        Assert.DoesNotContain("ManageUsers", tokenPermissions);
    }

    [Fact]
    public void Login_WhenRoleHasNoPermissions_ShouldReturnTokenWithNoPermissionClaims()
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Pass!");
        var fakeUser = new User
        {
            Id = 5, Email = "empty@itms.com", PasswordHash = passwordHash,
            Role = new Role { Name = "EmptyRole" }, RoleId = 99
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("empty@itms.com")).Returns(fakeUser);

        var roleService = BuildRoleServiceMock("EmptyRole", []);
        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

        var result = service.Login(new LoginDto { Email = "empty@itms.com", Password = "Pass!" });

        Assert.NotNull(result);
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(result.Token);
        var tokenPermissions = jwt.Claims.Where(c => c.Type == "permission").ToList();
        Assert.Empty(tokenPermissions);
    }

    [Fact]
    public void Register_ShouldEmbedEndUserPermissionsInToken()
    {
        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail(It.IsAny<string>())).Returns((User?)null);
        userRepo.Setup(r => r.Add(It.IsAny<User>()));

        var endUserPerms = new List<string> { "ViewTickets", "CreateTicket" };
        var roleService = new Mock<IRoleService>();
        roleService.Setup(r => r.GetPermissionNamesByRoleName("EndUser")).Returns(endUserPerms);

        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

        var result = service.Register(new RegisterDto
        {
            FullName = "New User",
            Email = "new@itms.com",
            Password = "Pass123!"
        });

        Assert.NotNull(result);
        Assert.Equal("EndUser", result.Role);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(result.Token);
        var tokenPermissions = jwt.Claims
            .Where(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToList();

        Assert.Contains("ViewTickets", tokenPermissions);
        Assert.Contains("CreateTicket", tokenPermissions);
        Assert.DoesNotContain("ManageUsers", tokenPermissions);
    }

    [Fact]
    public void Register_WhenEmailAlreadyExists_ShouldReturnNull()
    {
        var existing = new User { Email = "taken@itms.com", Role = new Role { Name = "EndUser" } };
        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetByEmail("taken@itms.com")).Returns(existing);

        var roleService = new Mock<IRoleService>();
        var service = new AuthService(userRepo.Object, BuildConfig(), roleService.Object);

        var result = service.Register(new RegisterDto
        {
            FullName = "Dupe", Email = "taken@itms.com", Password = "Pass123!"
        });

        Assert.Null(result);
        userRepo.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }
}
