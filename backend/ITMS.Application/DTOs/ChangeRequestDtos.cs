namespace ITMS.Application.DTOs;

public class CreateChangeRequestDto
{
    public string Title { get; set; } = string.Empty;
    public int RequestedById { get; set; }
}

public class ChangeRequestResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string RequestedBy { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
