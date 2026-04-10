using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class AssetService : IAssetService
{
    private readonly IAssetRepository _assetRepository;
    private readonly IAuditLogService _auditLogService;
    private readonly AppDbContext _context;

    public AssetService(IAssetRepository assetRepository, IAuditLogService auditLogService, AppDbContext context)
    {
        _assetRepository = assetRepository;
        _auditLogService = auditLogService;
        _context = context;
    }

    public List<AssetResponseDto> GetAll()
        => _context.Assets
            .Include(a => a.AssetType)
            .Include(a => a.Status)
            .Include(a => a.AssignedToUser)
            .ToList()
            .Select(MapToDto)
            .ToList();

    public AssetResponseDto? GetById(int id)
    {
        var asset = _context.Assets
            .Include(a => a.AssetType)
            .Include(a => a.Status)
            .Include(a => a.AssignedToUser)
            .FirstOrDefault(a => a.Id == id);
        return asset == null ? null : MapToDto(asset);
    }

    public List<AssetResponseDto> GetAvailableAssets()
        => _assetRepository.GetAvailableAssets().Select(MapToDto).ToList();

    public AssetResponseDto CreateAsset(CreateAssetDto dto)
    {
        var inStorageStatus = _context.Statuses.First(s => s.Name == "InStorage");
        var asset = new Asset
        {
            AssetName = dto.AssetName,
            AssetTypeId = dto.AssetTypeId,
            StatusId = inStorageStatus.Id
        };
        _assetRepository.Add(asset);
        _auditLogService.RecordAction(0, $"Asset created: {asset.AssetName}");

        var created = _context.Assets
            .Include(a => a.AssetType)
            .Include(a => a.Status)
            .First(a => a.Id == asset.Id);
        return MapToDto(created);
    }

    public void AssignAssetToUser(int assetId, AssignAssetDto dto)
    {
        var asset = _context.Assets.Include(a => a.Status).FirstOrDefault(a => a.Id == assetId);
        if (asset == null) throw new InvalidOperationException("Asset not found.");
        if (asset.Status.Name != "InStorage")
            throw new InvalidOperationException("Asset is not available for assignment.");

        var inUseStatus = _context.Statuses.First(s => s.Name == "InUse");
        asset.AssignedToUserId = dto.UserId;
        asset.StatusId = inUseStatus.Id;
        asset.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();

        _auditLogService.RecordAction(dto.UserId, $"Asset #{assetId} assigned to user #{dto.UserId}");
    }

    public AssetResponseDto? UpdateAssetStatus(int id, UpdateAssetStatusDto dto)
    {
        var asset = _context.Assets
            .Include(a => a.Status)
            .Include(a => a.AssetType)
            .Include(a => a.AssignedToUser)
            .FirstOrDefault(a => a.Id == id);
        if (asset == null) return null;

        asset.StatusId = dto.StatusId;
        asset.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
        _context.Entry(asset).Reference(a => a.Status).Load();
        _auditLogService.RecordAction(0, $"Asset #{id} status changed to statusId {dto.StatusId}");
        return MapToDto(asset);
    }

    private static AssetResponseDto MapToDto(Asset a) => new()
    {
        Id = a.Id,
        AssetName = a.AssetName,
        AssetType = a.AssetType?.TypeName ?? string.Empty,
        Status = a.Status?.Name ?? string.Empty,
        AssignedTo = a.AssignedToUser?.FullName,
        CreatedAt = a.CreatedAt
    };
}
