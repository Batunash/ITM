namespace ITMS.Domain.Entities;

public class Status : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<ChangeRequest> ChangeRequests { get; set; } = new List<ChangeRequest>();
    public ICollection<TicketHistory> OldStatusHistories { get; set; } = new List<TicketHistory>();
    public ICollection<TicketHistory> NewStatusHistories { get; set; } = new List<TicketHistory>();
}
