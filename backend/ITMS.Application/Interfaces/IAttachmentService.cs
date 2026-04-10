using ITMS.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace ITMS.Application.Interfaces;

public interface IAttachmentService
{
    string UploadFile(int ticketId, IFormFile file);
    List<Attachment> GetAttachments(int ticketId);
    Attachment? GetById(int id);
}
