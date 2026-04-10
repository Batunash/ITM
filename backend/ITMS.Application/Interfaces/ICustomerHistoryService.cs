using ITMS.Application.DTOs;
using ITMS.Domain.Entities;

namespace ITMS.Application.Interfaces;

public interface ICustomerHistoryService
{
    List<TicketResponseDto> GetTicketHistory(int userId);
    List<AssetResponseDto> GetAssignedAssets(int userId);
}
