namespace ITMS.Application.DTOs;

public class SlaDto
{
    public int Id { get; set; }
    public string Priority { get; set; } = string.Empty;
    public int TargetResolutionHours { get; set; }
}
