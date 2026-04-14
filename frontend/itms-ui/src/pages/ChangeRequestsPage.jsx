import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api.get('/change-requests').then(r => setRequests(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/change-requests', { title, requestedById: user?.userId });
    setRequests(prev => [data, ...prev]);
    setTitle('');
    setShowForm(false);
  };

  const statusColor = { Pending: '#f59e0b', Resolved: '#10b981', Closed: '#6b7280' };

  return (
    <Layout>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Change Requests</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Manage major IT infrastructure change approvals.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
          + Submit Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', padding: 20, marginBottom: 20, display: 'flex', gap: 12 }}>
          <input
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 14 }}
            placeholder="Change request title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <button type="submit" style={{ background: '#334155', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Submit</button>
          <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', border: 'none', padding: '10px 16px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ID', 'Title', 'Requested By', 'Status', 'Created At', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>#{r.id}</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{r.title}</td>
                <td style={{ padding: '12px 16px', fontSize: 14, color: '#64748b' }}>{r.requestedBy}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: (statusColor[r.status] || '#94a3b8') + '20', color: statusColor[r.status] || '#94a3b8', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{r.status}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={() => api.post(`/change-requests/${r.id}/approve`).then(() => setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'Resolved' } : x)))} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', padding: '5px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => api.post(`/change-requests/${r.id}/reject`).then(() => setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'Closed' } : x)))} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>Reject</button>
                    </>
                  )}
                  {r.status !== 'Pending' && <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No change requests</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
