namespace ITMS.Domain.Entities;

public class ChangeRequest : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public int RequestedById { get; set; }
    public User RequestedBy { get; set; } = null!;

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;
}
