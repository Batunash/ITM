using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/attachments")]
[Authorize]
public class AttachmentController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;

    public AttachmentController(IAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }

    [HttpPost("upload")]
    public IActionResult Upload([FromQuery] int ticketId, IFormFile file)
    {
        var path = _attachmentService.UploadFile(ticketId, file);
        return Ok(new { filePath = path });
    }

    [HttpGet("{ticketId}")]
    public IActionResult GetByTicket(int ticketId)
        => Ok(_attachmentService.GetAttachments(ticketId));

    [HttpGet("download/{id}")]
    public IActionResult Download(int id)
    {
        var attachment = _attachmentService.GetById(id);
        if (attachment == null || !System.IO.File.Exists(attachment.FilePath))
            return NotFound();
        var fileName = Path.GetFileName(attachment.FilePath);
        var underscoreIdx = fileName.IndexOf('_');
        var displayName = underscoreIdx >= 0 ? fileName[(underscoreIdx + 1)..] : fileName;
        return PhysicalFile(attachment.FilePath, "application/octet-stream", displayName);
    }
}
