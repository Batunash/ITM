using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("{userId}")]
    public IActionResult GetUnread(int userId)
        => Ok(_notificationService.GetUnreadNotifications(userId));

    [HttpPut("{id}/read")]
    public IActionResult MarkAsRead(int id)
    {
        _notificationService.MarkAsRead(id);
        return NoContent();
    }
}
