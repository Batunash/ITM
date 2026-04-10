import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

const STATUS_COLORS = { Open:'#3b82f6', Pending:'#f59e0b', Resolved:'#10b981', Closed:'#6b7280', InProgress:'#8b5cf6', Assigned:'#06b6d4' };
const ASSET_STATUS_COLORS = { InStorage:'#22c55e', InUse:'#3b82f6', Maintenance:'#f59e0b' };

const Badge = ({ text, colorMap }) => {
  const color = (colorMap && colorMap[text]) || '#94a3b8';
  return <span style={{ background: color+'20', color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{text}</span>;
};

export default function CustomerHistoryPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users').then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!selectedUser) return;
    setLoading(true); setError(''); setHistory(null);
    try {
      const { data } = await api.get(`/customers/${selectedUser}/history`);
      setHistory(data);
    } catch {
      setError('Failed to load history for this user.');
    } finally { setLoading(false); }
  };

  const userName = users.find(u => u.id === parseInt(selectedUser))?.fullName ?? '';

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Customer History</h1>
          <p style={s.subtitle}>View ticket and asset history for any user.</p>
        </div>
      </div>

      <div style={s.searchBar}>
        <select style={s.select} value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">Select a user...</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
        </select>
        <button style={s.searchBtn} onClick={handleSearch} disabled={!selectedUser || loading}>
          {loading ? 'Loading...' : 'View History'}
        </button>
      </div>

      {error && <div style={s.errBox}>{error}</div>}

      {history && (
        <div style={s.results}>
          <div style={s.sectionTitle}>History for <strong>{userName}</strong></div>

          {/* Tickets */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Ticket History</span>
              <span style={s.badge}>{history.tickets?.length ?? 0} tickets</span>
            </div>
            {history.tickets?.length === 0 ? (
              <p style={s.empty}>No tickets found for this user.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>{['ID','Title','Status','Priority','Assigned To','Created'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {history.tickets?.map(t => (
                    <tr key={t.id} style={s.tr}>
                      <td style={s.td}><span style={s.ticketId}>INC-{t.id}</span></td>
                      <td style={s.td}>{t.title}</td>
                      <td style={s.td}><Badge text={t.status} colorMap={STATUS_COLORS} /></td>
                      <td style={s.td}>{t.priority}</td>
                      <td style={s.td}>{t.assignedTo || <span style={{color:'#94a3b8'}}>Unassigned</span>}</td>
                      <td style={{...s.td, color:'#94a3b8'}}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Assets */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Assigned Assets</span>
              <span style={s.badge}>{history.assets?.length ?? 0} assets</span>
            </div>
            {history.assets?.length === 0 ? (
              <p style={s.empty}>No assets assigned to this user.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>{['ID','Asset Name','Type','Status','Assigned Since'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {history.assets?.map(a => (
                    <tr key={a.id} style={s.tr}>
                      <td style={s.td}><span style={s.ticketId}>#{a.id}</span></td>
                      <td style={{...s.td, fontWeight:600}}>{a.assetName}</td>
                      <td style={s.td}>{a.assetType}</td>
                      <td style={s.td}><Badge text={a.status} colorMap={ASSET_STATUS_COLORS} /></td>
                      <td style={{...s.td, color:'#94a3b8'}}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

const s = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  pageTitle: { margin:0, fontSize:22, fontWeight:700, color:'#0f172a' },
  subtitle: { margin:'4px 0 0', color:'#64748b', fontSize:14 },
  searchBar: { display:'flex', gap:12, marginBottom:24, alignItems:'center' },
  select: { flex:1, maxWidth:400, padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none' },
  searchBtn: { padding:'10px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' },
  errBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 },
  results: { display:'flex', flexDirection:'column', gap:20 },
  sectionTitle: { fontSize:16, color:'#374151', marginBottom:4 },
  card: { background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' },
  cardHead: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' },
  cardTitle: { fontSize:15, fontWeight:700, color:'#0f172a' },
  badge: { background:'#e0e7ff', color:'#3730a3', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f8fafc' },
  td: { padding:'12px 16px', fontSize:14, color:'#374151' },
  ticketId: { fontWeight:700, color:'#64748b', fontSize:13 },
  empty: { margin:0, padding:'20px 16px', color:'#94a3b8', fontSize:14 },
};
