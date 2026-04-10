namespace ITMS.Domain.Entities;

public class TicketHistory : BaseEntity
{
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public int UpdatedByUserId { get; set; }
    public User UpdatedBy { get; set; } = null!;

    public int OldStatusId { get; set; }
    public Status OldStatus { get; set; } = null!;

    public int NewStatusId { get; set; }
    public Status NewStatus { get; set; } = null!;

    public DateTime ChangedDate { get; set; } = DateTime.UtcNow;
}
