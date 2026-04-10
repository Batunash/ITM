namespace ITMS.Application.DTOs;

public class CreateAssetDto
{
    public string AssetName { get; set; } = string.Empty;
    public int AssetTypeId { get; set; }
}

public class AssignAssetDto
{
    public int UserId { get; set; }
}

public class UpdateAssetStatusDto
{
    public int StatusId { get; set; }
}

public class AssetResponseDto
{
    public int Id { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; }
}
