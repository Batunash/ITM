using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Domain.Interfaces;

namespace ITMS.Application.Services;

public class CustomerHistoryService : ICustomerHistoryService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IAssetRepository _assetRepository;

    public CustomerHistoryService(ITicketRepository ticketRepository, IAssetRepository assetRepository)
    {
        _ticketRepository = ticketRepository;
        _assetRepository = assetRepository;
    }

    public List<TicketResponseDto> GetTicketHistory(int userId)
        => _ticketRepository.GetTicketsByUserId(userId)
            .Select(t => new TicketResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status?.Name ?? string.Empty,
                Priority = t.Priority?.Name ?? string.Empty,
                CreatedBy = t.CreatedBy?.FullName ?? string.Empty,
                AssignedTo = t.AssignedTo?.FullName,
                CreatedAt = t.CreatedAt,
                ClosedAt = t.ClosedAt
            })
            .ToList();

    public List<AssetResponseDto> GetAssignedAssets(int userId)
        => _assetRepository.GetAssetsByUser(userId)
            .Select(a => new AssetResponseDto
            {
                Id = a.Id,
                AssetName = a.AssetName,
                AssetType = a.AssetType?.TypeName ?? string.Empty,
                Status = a.Status?.Name ?? string.Empty,
                AssignedTo = a.AssignedToUser?.FullName,
                CreatedAt = a.CreatedAt
            })
            .ToList();
}
