namespace ITMS.Domain.Entities;

public class Notification : BaseEntity
{
    public int SentById { get; set; }
    public User SentBy { get; set; } = null!;

    public int SentToId { get; set; }
    public User SentTo { get; set; } = null!;

    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
}
