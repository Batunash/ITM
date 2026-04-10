namespace ITMS.Domain.Entities;

public class AssetType : BaseEntity
{
    public string TypeName { get; set; } = string.Empty;

    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
