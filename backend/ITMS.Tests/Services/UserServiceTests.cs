using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Application.Services;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using Moq;

namespace ITMS.Tests.Services;

public class UserServiceTests
{
    [Fact]
    public void CreateUser_ShouldAddUserAndRecordAuditLog()
    {
        
        var userRepo = new Mock<IUserRepository>();
        var auditService = new Mock<IAuditLogService>();

        var capturedUser = (User?)null;
        userRepo.Setup(r => r.Add(It.IsAny<User>()))
            .Callback<User>(u => capturedUser = u);

        var service = new UserService(userRepo.Object, auditService.Object);

        var dto = new CreateUserDto
        {
            FullName = "Jane Doe",
            Email = "jane@itms.com",
            Password = "Secret123!",
            RoleId = 2
        };

        
        var result = service.CreateUser(dto);

        
        userRepo.Verify(r => r.Add(It.IsAny<User>()), Times.Once);
        auditService.Verify(a => a.RecordAction(It.IsAny<int>(), It.Is<string>(s => s.Contains("jane@itms.com"))), Times.Once);
        Assert.Equal("Jane Doe", result.FullName);
        Assert.Equal("jane@itms.com", result.Email);
        Assert.NotNull(capturedUser);
        
        Assert.NotEqual("Secret123!", capturedUser!.PasswordHash);
    }

    [Fact]
    public void DeleteUser_ShouldCallDeleteAndRecordAuditLog()
    {
        
        var userRepo = new Mock<IUserRepository>();
        var auditService = new Mock<IAuditLogService>();
        var service = new UserService(userRepo.Object, auditService.Object);

        
        service.DeleteUser(5);

        
        userRepo.Verify(r => r.Delete(5), Times.Once);
        auditService.Verify(a => a.RecordAction(5, It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public void GetAllUsers_ShouldReturnMappedDtos()
    {
        
        var fakeUsers = new List<User>
        {
            new User { Id = 1, FullName = "Alice", Email = "alice@itms.com", Role = new Role { Name = "EndUser" }, RoleId = 1 },
            new User { Id = 2, FullName = "Bob",   Email = "bob@itms.com",   Role = new Role { Name = "ITSupportAgent" }, RoleId = 2 },
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetAll()).Returns(fakeUsers);

        var auditService = new Mock<IAuditLogService>();
        var service = new UserService(userRepo.Object, auditService.Object);

        
        var result = service.GetAllUsers();

        
        Assert.Equal(2, result.Count);
        Assert.Equal("Alice", result[0].FullName);
        Assert.Equal("ITSupportAgent", result[1].Role);
    }

    [Fact]
    public void UpdateUser_WhenUserExists_ShouldUpdateAndReturnDto()
    {
        
        var existing = new User
        {
            Id = 3,
            FullName = "Old Name",
            Email = "old@itms.com",
            Role = new Role { Name = "EndUser" },
            RoleId = 1
        };

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetById(3)).Returns(existing);

        var auditService = new Mock<IAuditLogService>();
        var service = new UserService(userRepo.Object, auditService.Object);

        var dto = new UpdateUserDto { FullName = "New Name", Email = "new@itms.com", RoleId = 2 };

        
        var result = service.UpdateUser(3, dto);

        
        Assert.NotNull(result);
        Assert.Equal("New Name", result!.FullName);
        Assert.Equal("new@itms.com", result.Email);
        userRepo.Verify(r => r.Update(It.IsAny<User>()), Times.Once);
        auditService.Verify(a => a.RecordAction(3, It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public void UpdateUser_WhenUserNotFound_ShouldReturnNull()
    {
        
        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(r => r.GetById(It.IsAny<int>())).Returns((User?)null);

        var auditService = new Mock<IAuditLogService>();
        var service = new UserService(userRepo.Object, auditService.Object);

        
        var result = service.UpdateUser(99, new UpdateUserDto { FullName = "X", Email = "x@x.com", RoleId = 1 });

        
        Assert.Null(result);
        userRepo.Verify(r => r.Update(It.IsAny<User>()), Times.Never);
    }
}
