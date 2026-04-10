using ITMS.Application.DTOs;

namespace ITMS.Application.Interfaces;

public interface ITicketService
{
    List<TicketResponseDto> GetAll();
    TicketResponseDto? GetById(int id);
    List<TicketResponseDto> GetByUserId(int userId);
    TicketResponseDto CreateTicket(CreateTicketDto dto);
    void AssignAgent(int ticketId, AssignAgentDto dto);
    void UpdateStatus(int ticketId, int newStatusId);
    void UpdatePriority(int ticketId, int priorityId);
    void CloseTicket(int ticketId, CloseTicketDto dto);
}
