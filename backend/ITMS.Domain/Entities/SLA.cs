namespace ITMS.Domain.Entities;

public class SLA : BaseEntity
{
    public int PriorityId { get; set; }
    public Priority Priority { get; set; } = null!;

    public int TargetResolutionHours { get; set; }
}
