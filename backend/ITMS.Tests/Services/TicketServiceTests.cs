using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Application.Services;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace ITMS.Tests.Services;

public class TicketServiceTests
{
    private AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public void CreateTicket_ShouldReturnTicketWithOpenStatus()
    {
        
        var context = CreateInMemoryContext();
        context.Statuses.Add(new Status { Id = 1, Name = "Open" });
        context.Priorities.Add(new Priority { Id = 3, Name = "Medium" });
        context.Roles.Add(new Role { Id = 1, Name = "EndUser" });
        context.Users.Add(new User { Id = 1, FullName = "Test User", Email = "test@test.com", PasswordHash = "hash", RoleId = 1 });
        context.SaveChanges();

        var ticketRepo = new Mock<ITicketRepository>();
        ticketRepo.Setup(r => r.Add(It.IsAny<Ticket>()))
            .Callback<Ticket>(t => { context.Tickets.Add(t); context.SaveChanges(); });

        var auditService = new Mock<IAuditLogService>();
        var notificationService = new Mock<INotificationService>();

        var service = new TicketService(ticketRepo.Object, auditService.Object, notificationService.Object, context);

        var dto = new CreateTicketDto { UserId = 1, Title = "Test Ticket", Description = "Desc", PriorityId = 3 };

        
        var result = service.CreateTicket(dto);

        
        Assert.NotNull(result);
        Assert.Equal("Test Ticket", result.Title);
        Assert.Equal("Open", result.Status);
    }

    [Fact]
    public void CloseTicket_ShouldSetClosedAtAndSendNotification()
    {
        
        var context = CreateInMemoryContext();
        context.Statuses.AddRange(
            new Status { Id = 1, Name = "Open" },
            new Status { Id = 6, Name = "Closed" }
        );
        context.Priorities.Add(new Priority { Id = 1, Name = "Critical" });
        context.Roles.Add(new Role { Id = 1, Name = "EndUser" });
        context.Roles.Add(new Role { Id = 2, Name = "ITSupportAgent" });
        context.Users.AddRange(
            new User { Id = 1, FullName = "User", Email = "u@t.com", PasswordHash = "h", RoleId = 1 },
            new User { Id = 2, FullName = "Agent", Email = "a@t.com", PasswordHash = "h", RoleId = 2 }
        );
        context.Tickets.Add(new Ticket { Id = 1, Title = "Ticket", Description = "D", StatusId = 1, PriorityId = 1, CreatedById = 1 });
        context.SaveChanges();

        var ticketRepo = new Mock<ITicketRepository>();
        var auditService = new Mock<IAuditLogService>();
        var notificationService = new Mock<INotificationService>();
        notificationService.Setup(n => n.Send(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>())).Verifiable();

        var service = new TicketService(ticketRepo.Object, auditService.Object, notificationService.Object, context);

        
        service.CloseTicket(1, new CloseTicketDto { ClosedById = 2 });

        
        var ticket = context.Tickets.Find(1);
        Assert.NotNull(ticket!.ClosedAt);
        Assert.Equal(6, ticket.StatusId);
        notificationService.Verify(n => n.Send(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public void AssignAgent_ShouldUpdateTicketAndLogHistory()
    {
        
        var context = CreateInMemoryContext();
        context.Statuses.AddRange(
            new Status { Id = 1, Name = "Open" },
            new Status { Id = 2, Name = "Assigned" }
        );
        context.Priorities.Add(new Priority { Id = 3, Name = "Medium" });
        context.Roles.AddRange(
            new Role { Id = 1, Name = "EndUser" },
            new Role { Id = 2, Name = "ITSupportAgent" },
            new Role { Id = 3, Name = "ITManager" }
        );
        context.Users.AddRange(
            new User { Id = 1, FullName = "User", Email = "u@t.com", PasswordHash = "h", RoleId = 1 },
            new User { Id = 2, FullName = "Agent", Email = "a@t.com", PasswordHash = "h", RoleId = 2 },
            new User { Id = 3, FullName = "Manager", Email = "m@t.com", PasswordHash = "h", RoleId = 3 }
        );
        context.Tickets.Add(new Ticket { Id = 1, Title = "T", Description = "D", StatusId = 1, PriorityId = 3, CreatedById = 1 });
        context.SaveChanges();

        var ticketRepo = new Mock<ITicketRepository>();
        var auditService = new Mock<IAuditLogService>();
        var notificationService = new Mock<INotificationService>();

        var service = new TicketService(ticketRepo.Object, auditService.Object, notificationService.Object, context);

        
        service.AssignAgent(1, new AssignAgentDto { AgentId = 2, ManagerId = 3 });

        
        var ticket = context.Tickets.Find(1);
        Assert.Equal(2, ticket!.AssignedToId);
        Assert.Equal(2, ticket.StatusId);
        Assert.True(context.TicketHistories.Any(th => th.TicketId == 1));
    }
}
