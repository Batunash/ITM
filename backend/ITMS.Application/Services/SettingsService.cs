using ITMS.Application.Interfaces;
using ITMS.Domain.Entities;
using ITMS.Infrastructure.Data;

namespace ITMS.Application.Services;

public class SettingsService : ISettingsService
{
    private readonly AppDbContext _context;

    public SettingsService(AppDbContext context)
    {
        _context = context;
    }

    public List<SystemSetting> GetSettings()
        => _context.SystemSettings.ToList();

    public void UpdateSetting(string key, string value)
    {
        var setting = _context.SystemSettings.FirstOrDefault(s => s.Key == key);
        if (setting == null)
        {
            _context.SystemSettings.Add(new SystemSetting
            {
                Key = key,
                Value = value,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
        }
        _context.SaveChanges();
    }
}
