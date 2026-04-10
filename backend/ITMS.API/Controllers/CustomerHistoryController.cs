using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomerHistoryController : ControllerBase
{
    private readonly ICustomerHistoryService _customerHistoryService;

    public CustomerHistoryController(ICustomerHistoryService customerHistoryService)
    {
        _customerHistoryService = customerHistoryService;
    }

    [HttpGet("{userId}/history")]
    public IActionResult GetHistory(int userId)
    {
        return Ok(new
        {
            Tickets = _customerHistoryService.GetTicketHistory(userId),
            Assets = _customerHistoryService.GetAssignedAssets(userId)
        });
    }
}
