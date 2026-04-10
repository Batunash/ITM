using ITMS.Application.DTOs;

namespace ITMS.Application.Interfaces;

public interface IAssetService
{
    List<AssetResponseDto> GetAll();
    List<AssetResponseDto> GetAvailableAssets();
    AssetResponseDto CreateAsset(CreateAssetDto dto);
    void AssignAssetToUser(int assetId, AssignAssetDto dto);
    AssetResponseDto? GetById(int id);
    AssetResponseDto? UpdateAssetStatus(int id, UpdateAssetStatusDto dto);
}
