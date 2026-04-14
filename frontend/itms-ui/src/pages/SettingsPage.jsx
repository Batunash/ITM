import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

const COMMON_SETTINGS = [
  { key: 'max_tickets_per_agent', description: 'Max open tickets per support agent', example: '20' },
  { key: 'ticket_auto_close_days', description: 'Days after resolution to auto-close ticket', example: '7' },
  { key: 'sla_breach_notification', description: 'Send notifications on SLA breach (true/false)', example: 'true' },
  { key: 'default_ticket_priority', description: 'Default priority for new tickets', example: 'Medium' },
  { key: 'max_file_upload_mb', description: 'Max attachment file size in MB', example: '10' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'success' | 'error' | ''

  useEffect(() => {
    api.get('/settings').then(r => setSettings(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveStatus('');
    try {
      await api.put(`/settings?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`);
      const existing = settings.find(s => s.key === key);
      if (existing) {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      } else {
        setSettings(prev => [...prev, { key, value }]);
      }
      setKey('');
      setValue('');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const prefill = (settingKey, settingExample) => {
    setKey(settingKey);
    setValue(settingExample);
  };

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>System Settings</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Configure general application settings and system parameters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Current Settings</h3>
          {settings.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No settings configured yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>KEY</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>VALUE</th>
                  <th style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }} />
                </tr>
              </thead>
              <tbody>
                {settings.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '10px 0', fontSize: 14, fontWeight: 600 }}>{s.key}</td>
                    <td style={{ padding: '10px 0', fontSize: 14, color: '#64748b' }}>{s.value}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      <button
                        style={{ background: 'none', border: 'none', fontSize: 12, color: '#334155', cursor: 'pointer', padding: '2px 6px' }}
                        onClick={() => prefill(s.key, s.value)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Update Setting</h3>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Setting Key</label>
              <input style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} placeholder="e.g., max_tickets_per_agent" value={key} onChange={e => setKey(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Value</label>
              <input style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }} placeholder="e.g., 20" value={value} onChange={e => setValue(e.target.value)} required />
            </div>
            {saveStatus === 'success' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '8px 12px', borderRadius: 4, fontSize: 13 }}>
                ✓ Setting saved successfully.
              </div>
            )}
            {saveStatus === 'error' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: 4, fontSize: 13 }}>
                Failed to save setting. Please try again.
              </div>
            )}
            <button type="submit" style={{ background: '#334155', color: '#fff', border: 'none', padding: '12px', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save Setting</button>
          </form>
        </div>
      </div>

      {}
      <div style={{ background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Common Settings</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>Click a row to pre-fill the form above with that setting's recommended value.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['KEY', 'DESCRIPTION', 'DEFAULT'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMMON_SETTINGS.map(cs => (
              <tr key={cs.key} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}
                onClick={() => prefill(cs.key, cs.example)}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{cs.key}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#64748b' }}>{cs.description}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{cs.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
