using ITMS.Application.DTOs;
using ITMS.Domain.Entities;

namespace ITMS.Application.Interfaces;

public interface ISlaService
{
    bool CheckCompliance(Ticket ticket);
    List<Ticket> GetSlaViolations();
    List<SlaDto> GetAll();
    List<TicketResponseDto> GetViolationDtos();
}
