namespace ITMS.Domain.Entities;

public class Asset : BaseEntity
{
    public string AssetName { get; set; } = string.Empty;

    public int AssetTypeId { get; set; }
    public AssetType AssetType { get; set; } = null!;

    public int? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }

    public int StatusId { get; set; }
    public Status Status { get; set; } = null!;
}
