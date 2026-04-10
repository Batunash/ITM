using ITMS.Domain.Entities;

namespace ITMS.Domain.Interfaces;

public interface IAssetRepository : IGenericRepository<Asset>
{
    List<Asset> GetAvailableAssets();
    List<Asset> GetAssetsByUser(int userId);
}
