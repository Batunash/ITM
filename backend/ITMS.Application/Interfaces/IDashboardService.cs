using ITMS.Application.DTOs;
using ITMS.Domain.Entities;

namespace ITMS.Application.Interfaces;

public interface IDashboardService
{
    DashboardStatsDto GetStats();
    List<TicketResponseDto> GetRecentTickets(int limit);
}
