namespace ITMS.Domain.Entities;

public class Priority : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<SLA> SLAs { get; set; } = new List<SLA>();
}
