using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Infrastructure.Repositories;

public class AssetRepository : GenericRepository<Asset>, IAssetRepository
{
    public AssetRepository(AppDbContext context) : base(context) { }

    public List<Asset> GetAvailableAssets()
        => _context.Assets
            .Include(a => a.AssetType)
            .Include(a => a.Status)
            .Where(a => a.Status.Name == "InStorage")
            .ToList();

    public List<Asset> GetAssetsByUser(int userId)
        => _context.Assets
            .Include(a => a.AssetType)
            .Include(a => a.Status)
            .Include(a => a.AssignedToUser)
            .Where(a => a.AssignedToUserId == userId)
            .ToList();
}
