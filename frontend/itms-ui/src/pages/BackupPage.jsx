import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

export default function BackupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [log, setLog] = useState([]);

  const handleTrigger = async () => {
    setLoading(true); setResult(''); setError('');
    try {
      const { data } = await api.post('/backup/trigger');
      if (data?.success === false) throw new Error(data.message);
      const message = data?.message ?? 'Backup triggered.';
      const filePath = data?.filePath ?? '';
      setResult({ message, filePath });
      setLog(prev => [{ time: new Date().toLocaleString(), message, filePath, status: 'success' }, ...prev]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Backup failed. Ensure pg_dump is installed and in PATH.';
      setError(msg);
      setLog(prev => [{ time: new Date().toLocaleString(), message: msg, filePath: '', status: 'error' }, ...prev]);
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Database Backup</h1>
          <p style={s.subtitle}>Trigger a manual system backup. Backup files are stored on the server.</p>
        </div>
      </div>

      <div style={s.grid}>
        {}
        <div style={s.card}>
          <div style={s.cardIcon}>💾</div>
          <div style={s.cardTitle}>Manual Backup</div>
          <div style={s.cardDesc}>
            Creates a timestamped SQL dump of the current database state. Use this before major changes or migrations.
          </div>

          {result && (
            <div style={s.okBox}>
              <div style={{fontWeight:700, marginBottom:6}}>✓ Backup completed</div>
              <div style={{fontSize:12, color:'#166534', marginBottom:4}}>Saved to:</div>
              <code style={{fontSize:12, background:'#dcfce7', padding:'4px 8px', borderRadius:4, display:'block', wordBreak:'break-all'}}>{result.filePath}</code>
            </div>
          )}
          {error && (
            <div style={s.errBox}>{error}</div>
          )}

          <button style={{ ...s.triggerBtn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleTrigger}>
            {loading ? 'Running Backup...' : '▶ Trigger Backup Now'}
          </button>
        </div>

        {}
        <div style={s.card}>
          <div style={s.cardIcon}>ℹ️</div>
          <div style={s.cardTitle}>Backup Info</div>
          <div style={s.infoList}>
            {[
              { label: 'Format', value: 'PostgreSQL .sql dump' },
              { label: 'Naming', value: 'itms_backup_YYYYMMDD_HHmmss.sql' },
              { label: 'Location', value: 'Server backup directory' },
              { label: 'Access', value: 'SystemAdmin only' },
            ].map(item => (
              <div key={item.label} style={s.infoRow}>
                <span style={s.infoLabel}>{item.label}</span>
                <span style={s.infoValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div style={s.logCard}>
        <div style={s.logHead}>
          <span style={s.logTitle}>Session Backup Log</span>
          {log.length > 0 && (
            <button style={s.clearBtn} onClick={() => setLog([])}>Clear</button>
          )}
        </div>
        {log.length === 0 ? (
          <p style={s.empty}>No backups triggered this session.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>{['Time', 'File Path', 'Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {log.map((entry, i) => (
                <tr key={i} style={s.tr}>
                  <td style={{...s.td, color:'#94a3b8', whiteSpace:'nowrap'}}>{entry.time}</td>
                  <td style={{...s.td, fontFamily:'monospace', fontSize:12, wordBreak:'break-all'}}>
                    {entry.filePath || <span style={{color:'#94a3b8'}}>{entry.message}</span>}
                  </td>
                  <td style={s.td}>
                    <span style={{ color: entry.status === 'success' ? '#16a34a' : '#dc2626', fontWeight:600, fontSize:13 }}>
                      {entry.status === 'success' ? '✓ Success' : '✕ Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const s = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  pageTitle: { margin:0, fontSize:22, fontWeight:700, color:'#0f172a' },
  subtitle: { margin:'4px 0 0', color:'#64748b', fontSize:14 },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 },
  card: { background:'#fff', borderRadius: 4, border:'1px solid #e2e8f0', padding:28, display:'flex', flexDirection:'column', gap:14 },
  cardIcon: { fontSize:32 },
  cardTitle: { fontSize:16, fontWeight:700, color:'#0f172a' },
  cardDesc: { fontSize:14, color:'#64748b', lineHeight:1.6 },
  okBox: { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'10px 14px', borderRadius: 4, fontSize:13 },
  errBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'10px 14px', borderRadius: 4, fontSize:13 },
  triggerBtn: { background:'#334155', color:'#fff', border:'none', padding:'13px 20px', borderRadius: 4, fontSize:14, fontWeight:700, cursor:'pointer', marginTop:4 },
  infoList: { display:'flex', flexDirection:'column', gap:10 },
  infoRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f1f5f9' },
  infoLabel: { fontSize:13, color:'#64748b', fontWeight:600 },
  infoValue: { fontSize:13, color:'#374151', fontFamily:'monospace' },
  logCard: { background:'#fff', borderRadius: 4, border:'1px solid #e2e8f0', overflow:'hidden' },
  logHead: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' },
  logTitle: { fontSize:15, fontWeight:700, color:'#0f172a' },
  clearBtn: { background:'none', border:'1px solid #e2e8f0', borderRadius: 4, padding:'4px 12px', fontSize:12, cursor:'pointer', color:'#64748b' },
  empty: { margin:0, padding:'20px', color:'#94a3b8', fontSize:14 },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f8fafc' },
  td: { padding:'12px 16px', fontSize:14, color:'#374151' },
};
