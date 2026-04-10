using ITMS.Application.DTOs;

namespace ITMS.Application.Interfaces;

public interface IChangeRequestService
{
    List<ChangeRequestResponseDto> GetAll();
    ChangeRequestResponseDto? GetById(int id);
    ChangeRequestResponseDto SubmitRequest(CreateChangeRequestDto dto);
    void Approve(int changeRequestId);
    void Reject(int changeRequestId);
}
