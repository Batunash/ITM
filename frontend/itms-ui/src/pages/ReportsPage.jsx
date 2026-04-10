import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

export default function ReportsPage() {
  const [ticketStats, setTicketStats] = useState([]);
  const [slaReport, setSlaReport] = useState([]);
  const [agentReport, setAgentReport] = useState([]);
  const [activeTab, setActiveTab] = useState('tickets');

  useEffect(() => {
    api.get('/reports/tickets').then(r => setTicketStats(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/reports/sla').then(r => setSlaReport(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/reports/agents').then(r => setAgentReport(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Reports &amp; Analytics</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Performance reports based on ticket resolution and system usage.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['tickets', 'Ticket Resolution'], ['sla', 'SLA Compliance'], ['agents', 'Agent Performance']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: activeTab === key ? '#2563eb' : '#f1f5f9', color: activeTab === key ? '#fff' : '#374151' }}>{label}</button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {activeTab === 'tickets' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['ID', 'Title', 'Priority', 'Created', 'Closed', 'Resolution (hrs)'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {ticketStats.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>#{t.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.priority}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{t.closedAt ? new Date(t.closedAt).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700 }}>{t.resolutionHours?.toFixed(1)}</td>
                </tr>
              ))}
              {ticketStats.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No closed tickets yet</td></tr>}
            </tbody>
          </table>
        )}
        {activeTab === 'sla' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['ID', 'Title', 'Priority', 'Resolution (hrs)', 'Target (hrs)', 'Compliant'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {slaReport.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>#{t.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.priority}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.resolutionHours?.toFixed(1)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.targetHours}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: t.isCompliant ? '#dcfce7' : '#fee2e2', color: t.isCompliant ? '#16a34a' : '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {t.isCompliant ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
              {slaReport.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No data</td></tr>}
            </tbody>
          </table>
        )}
        {activeTab === 'agents' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Agent', 'Closed Tickets', 'Avg Resolution (hrs)'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {agentReport.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{a.agent}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{a.closedTickets}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{a.avgResolutionHours?.toFixed(1)}</td>
                </tr>
              ))}
              {agentReport.length === 0 && <tr><td colSpan={3} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No data</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
