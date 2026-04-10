using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class AttachmentService : IAttachmentService
{
    private readonly AppDbContext _context;
    private readonly string _uploadPath;

    public AttachmentService(AppDbContext context)
    {
        _context = context;
        _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        if (!Directory.Exists(_uploadPath))
            Directory.CreateDirectory(_uploadPath);
    }

    public string UploadFile(int ticketId, IFormFile file)
    {
        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(_uploadPath, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        file.CopyTo(stream);

        _context.Attachments.Add(new Attachment
        {
            TicketId = ticketId,
            FilePath = filePath,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();
        return filePath;
    }

    public List<Attachment> GetAttachments(int ticketId)
        => _context.Attachments
            .Where(a => a.TicketId == ticketId)
            .ToList();

    public Attachment? GetById(int id)
        => _context.Attachments.FirstOrDefault(a => a.Id == id);
}
