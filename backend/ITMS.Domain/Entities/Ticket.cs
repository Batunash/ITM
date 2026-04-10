namespace ITMS.Domain.Entities;

public class Ticket : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;

    public int PriorityId { get; set; }
    public Priority Priority { get; set; } = null!;

    public int CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    public int? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }

    public DateTime? ClosedAt { get; set; }

    public ICollection<TicketHistory> HistoryLogs { get; set; } = new List<TicketHistory>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}
