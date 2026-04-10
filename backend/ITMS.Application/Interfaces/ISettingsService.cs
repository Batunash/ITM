using ITMS.Domain.Entities;

namespace ITMS.Application.Interfaces;

public interface ISettingsService
{
    List<SystemSetting> GetSettings();
    void UpdateSetting(string key, string value);
}
