using ITMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketHistory> TicketHistories => Set<TicketHistory>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<Priority> Priorities => Set<Priority>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<AssetType> AssetTypes => Set<AssetType>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SLA> SLAs => Set<SLA>();
    public DbSet<ChangeRequest> ChangeRequests => Set<ChangeRequest>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User -> Role
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ticket -> CreatedBy
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.CreatedBy)
            .WithMany(u => u.CreatedTickets)
            .HasForeignKey(t => t.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Ticket -> AssignedTo
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.AssignedTo)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(t => t.AssignedToId)
            .OnDelete(DeleteBehavior.SetNull);

        // Ticket -> Status
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Status)
            .WithMany(s => s.Tickets)
            .HasForeignKey(t => t.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ticket -> Priority
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Priority)
            .WithMany(p => p.Tickets)
            .HasForeignKey(t => t.PriorityId)
            .OnDelete(DeleteBehavior.Restrict);

        // TicketHistory -> Ticket
        modelBuilder.Entity<TicketHistory>()
            .HasOne(th => th.Ticket)
            .WithMany(t => t.HistoryLogs)
            .HasForeignKey(th => th.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        // TicketHistory -> UpdatedBy
        modelBuilder.Entity<TicketHistory>()
            .HasOne(th => th.UpdatedBy)
            .WithMany(u => u.TicketHistories)
            .HasForeignKey(th => th.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // TicketHistory -> OldStatus
        modelBuilder.Entity<TicketHistory>()
            .HasOne(th => th.OldStatus)
            .WithMany(s => s.OldStatusHistories)
            .HasForeignKey(th => th.OldStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // TicketHistory -> NewStatus
        modelBuilder.Entity<TicketHistory>()
            .HasOne(th => th.NewStatus)
            .WithMany(s => s.NewStatusHistories)
            .HasForeignKey(th => th.NewStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Asset -> AssetType
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.AssetType)
            .WithMany(at => at.Assets)
            .HasForeignKey(a => a.AssetTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Asset -> AssignedToUser
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.AssignedToUser)
            .WithMany(u => u.AssignedAssets)
            .HasForeignKey(a => a.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Asset -> Status
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.Status)
            .WithMany(s => s.Assets)
            .HasForeignKey(a => a.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Notification -> SentBy
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.SentBy)
            .WithMany(u => u.SentNotifications)
            .HasForeignKey(n => n.SentById)
            .OnDelete(DeleteBehavior.Restrict);

        // Notification -> SentTo
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.SentTo)
            .WithMany(u => u.ReceivedNotifications)
            .HasForeignKey(n => n.SentToId)
            .OnDelete(DeleteBehavior.Restrict);

        // SLA -> Priority
        modelBuilder.Entity<SLA>()
            .HasOne(s => s.Priority)
            .WithMany(p => p.SLAs)
            .HasForeignKey(s => s.PriorityId)
            .OnDelete(DeleteBehavior.Restrict);

        // ChangeRequest -> RequestedBy
        modelBuilder.Entity<ChangeRequest>()
            .HasOne(cr => cr.RequestedBy)
            .WithMany(u => u.ChangeRequests)
            .HasForeignKey(cr => cr.RequestedById)
            .OnDelete(DeleteBehavior.Restrict);

        // ChangeRequest -> Status
        modelBuilder.Entity<ChangeRequest>()
            .HasOne(cr => cr.Status)
            .WithMany(s => s.ChangeRequests)
            .HasForeignKey(cr => cr.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Attachment -> Ticket
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Ticket)
            .WithMany(t => t.Attachments)
            .HasForeignKey(a => a.TicketId)
            .OnDelete(DeleteBehavior.Cascade);

        // AuditLog -> User
        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // RolePermission -> Role
        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // RolePermission -> Permission
        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var seed = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "EndUser", CreatedAt = seed, UpdatedAt = seed },
            new Role { Id = 2, Name = "ITSupportAgent", CreatedAt = seed, UpdatedAt = seed },
            new Role { Id = 3, Name = "ITManager", CreatedAt = seed, UpdatedAt = seed },
            new Role { Id = 4, Name = "SystemAdmin", CreatedAt = seed, UpdatedAt = seed }
        );

        // Permissions
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, Name = "ViewTickets", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 2, Name = "CreateTicket", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 3, Name = "AssignTicket", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 4, Name = "CloseTicket", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 5, Name = "ManageUsers", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 6, Name = "ManageAssets", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 7, Name = "ViewReports", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 8, Name = "ViewAuditLogs", CreatedAt = seed, UpdatedAt = seed },
            new Permission { Id = 9, Name = "ManageSettings", CreatedAt = seed, UpdatedAt = seed }
        );

        // RolePermissions
        modelBuilder.Entity<RolePermission>().HasData(
            // EndUser: ViewTickets, CreateTicket
            new RolePermission { Id = 1, RoleId = 1, PermissionId = 1, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 2, RoleId = 1, PermissionId = 2, CreatedAt = seed, UpdatedAt = seed },
            // ITSupportAgent: ViewTickets, CloseTicket
            new RolePermission { Id = 3, RoleId = 2, PermissionId = 1, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 4, RoleId = 2, PermissionId = 4, CreatedAt = seed, UpdatedAt = seed },
            // ITManager: all except ManageSettings
            new RolePermission { Id = 5, RoleId = 3, PermissionId = 1, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 6, RoleId = 3, PermissionId = 2, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 7, RoleId = 3, PermissionId = 3, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 8, RoleId = 3, PermissionId = 4, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 9, RoleId = 3, PermissionId = 6, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 10, RoleId = 3, PermissionId = 7, CreatedAt = seed, UpdatedAt = seed },
            // SystemAdmin: all
            new RolePermission { Id = 11, RoleId = 4, PermissionId = 1, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 12, RoleId = 4, PermissionId = 2, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 13, RoleId = 4, PermissionId = 3, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 14, RoleId = 4, PermissionId = 4, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 15, RoleId = 4, PermissionId = 5, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 16, RoleId = 4, PermissionId = 6, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 17, RoleId = 4, PermissionId = 7, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 18, RoleId = 4, PermissionId = 8, CreatedAt = seed, UpdatedAt = seed },
            new RolePermission { Id = 19, RoleId = 4, PermissionId = 9, CreatedAt = seed, UpdatedAt = seed }
        );

        // Statuses
        modelBuilder.Entity<Status>().HasData(
            new Status { Id = 1, Name = "Open", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 2, Name = "Assigned", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 3, Name = "InProgress", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 4, Name = "Pending", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 5, Name = "Resolved", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 6, Name = "Closed", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 7, Name = "InStorage", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 8, Name = "InUse", CreatedAt = seed, UpdatedAt = seed },
            new Status { Id = 9, Name = "Maintenance", CreatedAt = seed, UpdatedAt = seed }
        );

        // Priorities
        modelBuilder.Entity<Priority>().HasData(
            new Priority { Id = 1, Name = "Critical", CreatedAt = seed, UpdatedAt = seed },
            new Priority { Id = 2, Name = "High", CreatedAt = seed, UpdatedAt = seed },
            new Priority { Id = 3, Name = "Medium", CreatedAt = seed, UpdatedAt = seed },
            new Priority { Id = 4, Name = "Low", CreatedAt = seed, UpdatedAt = seed }
        );

        // AssetTypes
        modelBuilder.Entity<AssetType>().HasData(
            new AssetType { Id = 1, TypeName = "Laptop", CreatedAt = seed, UpdatedAt = seed },
            new AssetType { Id = 2, TypeName = "Monitor", CreatedAt = seed, UpdatedAt = seed },
            new AssetType { Id = 3, TypeName = "Mobile", CreatedAt = seed, UpdatedAt = seed },
            new AssetType { Id = 4, TypeName = "Peripheral", CreatedAt = seed, UpdatedAt = seed },
            new AssetType { Id = 5, TypeName = "Server", CreatedAt = seed, UpdatedAt = seed }
        );

        // SLAs
        modelBuilder.Entity<SLA>().HasData(
            new SLA { Id = 1, PriorityId = 1, TargetResolutionHours = 4, CreatedAt = seed, UpdatedAt = seed },
            new SLA { Id = 2, PriorityId = 2, TargetResolutionHours = 8, CreatedAt = seed, UpdatedAt = seed },
            new SLA { Id = 3, PriorityId = 3, TargetResolutionHours = 24, CreatedAt = seed, UpdatedAt = seed },
            new SLA { Id = 4, PriorityId = 4, TargetResolutionHours = 72, CreatedAt = seed, UpdatedAt = seed }
        );

        // Default system settings
        modelBuilder.Entity<SystemSetting>().HasData(
            new SystemSetting { Id = 1, Key = "max_tickets_per_agent", Value = "20", CreatedAt = seed, UpdatedAt = seed },
            new SystemSetting { Id = 2, Key = "ticket_auto_close_days", Value = "7", CreatedAt = seed, UpdatedAt = seed },
            new SystemSetting { Id = 3, Key = "sla_breach_notification", Value = "true", CreatedAt = seed, UpdatedAt = seed },
            new SystemSetting { Id = 4, Key = "default_ticket_priority", Value = "Medium", CreatedAt = seed, UpdatedAt = seed },
            new SystemSetting { Id = 5, Key = "max_file_upload_mb", Value = "10", CreatedAt = seed, UpdatedAt = seed }
        );

        // Demo users (BCrypt hashed "Password123!")
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FullName = "End User Demo", Email = "enduser@itms.com", PasswordHash = "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G", RoleId = 1, CreatedAt = seed, UpdatedAt = seed },
            new User { Id = 2, FullName = "Agent Demo", Email = "agent@itms.com", PasswordHash = "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G", RoleId = 2, CreatedAt = seed, UpdatedAt = seed },
            new User { Id = 3, FullName = "Manager Demo", Email = "manager@itms.com", PasswordHash = "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G", RoleId = 3, CreatedAt = seed, UpdatedAt = seed },
            new User { Id = 4, FullName = "Admin Demo", Email = "admin@itms.com", PasswordHash = "$2a$11$SyvrsxlVhcz.qezKwEc3W.4ijQS.ddfLBLjmcnDDP9yvVadk1vY8G", RoleId = 4, CreatedAt = seed, UpdatedAt = seed }
        );
    }
}
