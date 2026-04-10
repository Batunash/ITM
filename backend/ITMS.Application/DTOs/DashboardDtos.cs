namespace ITMS.Application.DTOs;

public class DashboardStatsDto
{
    public int OpenTickets { get; set; }
    public int PendingAssets { get; set; }
    public int ActiveAgents { get; set; }
    public List<StatusCountDto> TicketsByStatus { get; set; } = new();
    public List<PriorityCountDto> TicketsByPriority { get; set; } = new();
}

public class StatusCountDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class PriorityCountDto
{
    public string Priority { get; set; } = string.Empty;
    public int Count { get; set; }
}
