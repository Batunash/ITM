namespace ITMS.Application.Interfaces;

public interface IReportService
{
    object GetTicketResolutionStats();
    object GetSLAComplianceReport();
    object GetAgentPerformanceReport();
}
