using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ITMS.Application.Services;

public class ChangeRequestService : IChangeRequestService
{
    private readonly IChangeRequestRepository _changeRequestRepository;
    private readonly IAuditLogService _auditLogService;
    private readonly AppDbContext _context;

    public ChangeRequestService(IChangeRequestRepository changeRequestRepository, IAuditLogService auditLogService, AppDbContext context)
    {
        _changeRequestRepository = changeRequestRepository;
        _auditLogService = auditLogService;
        _context = context;
    }

    public List<ChangeRequestResponseDto> GetAll()
        => _context.ChangeRequests
            .Include(cr => cr.RequestedBy)
            .Include(cr => cr.Status)
            .ToList()
            .Select(MapToDto)
            .ToList();

    public ChangeRequestResponseDto? GetById(int id)
    {
        var cr = _context.ChangeRequests
            .Include(c => c.RequestedBy)
            .Include(c => c.Status)
            .FirstOrDefault(c => c.Id == id);
        return cr == null ? null : MapToDto(cr);
    }

    public ChangeRequestResponseDto SubmitRequest(CreateChangeRequestDto dto)
    {
        var pendingStatus = _context.Statuses.First(s => s.Name == "Pending");
        var cr = new ChangeRequest
        {
            Title = dto.Title,
            RequestedById = dto.RequestedById,
            StatusId = pendingStatus.Id
        };
        _changeRequestRepository.Add(cr);
        _auditLogService.RecordAction(dto.RequestedById, $"Change request submitted: {cr.Title}");

        var created = _context.ChangeRequests
            .Include(c => c.RequestedBy)
            .Include(c => c.Status)
            .First(c => c.Id == cr.Id);
        return MapToDto(created);
    }

    public void Approve(int changeRequestId)
    {
        var cr = _context.ChangeRequests.Find(changeRequestId);
        if (cr == null) return;
        var resolvedStatus = _context.Statuses.First(s => s.Name == "Resolved");
        cr.StatusId = resolvedStatus.Id;
        cr.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
        _auditLogService.RecordAction(cr.RequestedById, $"Change request #{changeRequestId} approved");
    }

    public void Reject(int changeRequestId)
    {
        var cr = _context.ChangeRequests.Find(changeRequestId);
        if (cr == null) return;
        var closedStatus = _context.Statuses.First(s => s.Name == "Closed");
        cr.StatusId = closedStatus.Id;
        cr.UpdatedAt = DateTime.UtcNow;
        _context.SaveChanges();
        _auditLogService.RecordAction(cr.RequestedById, $"Change request #{changeRequestId} rejected");
    }

    private static ChangeRequestResponseDto MapToDto(ChangeRequest cr) => new()
    {
        Id = cr.Id,
        Title = cr.Title,
        RequestedBy = cr.RequestedBy?.FullName ?? string.Empty,
        Status = cr.Status?.Name ?? string.Empty,
        CreatedAt = cr.CreatedAt
    };
}
