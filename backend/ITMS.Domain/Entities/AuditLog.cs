namespace ITMS.Domain.Entities;

public class AuditLog : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Action { get; set; } = string.Empty;
}
