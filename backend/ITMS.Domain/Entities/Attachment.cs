namespace ITMS.Domain.Entities;

public class Attachment : BaseEntity
{
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public string FilePath { get; set; } = string.Empty;
}
