import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs')
      .then(r => setLogs(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'#0f172a' }}>Audit Logs</h1>
        <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:14 }}>Record of all critical actions performed in the system.</p>
      </div>

      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>{['ID','User','Action','Timestamp'].map(h => (
              <th key={h} style={{ textAlign:'left', padding:'12px 16px', fontSize:12, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom:'1px solid #f8fafc' }}>
                <td style={{ padding:'12px 16px', fontSize:13, color:'#94a3b8' }}>#{log.id}</td>
                <td style={{ padding:'12px 16px', fontSize:14, fontWeight:600 }}>{log.user ?? `User #${log.userId}`}</td>
                <td style={{ padding:'12px 16px', fontSize:14, color:'#374151' }}>{log.action}</td>
                <td style={{ padding:'12px 16px', fontSize:13, color:'#64748b' }}>
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={4} style={{ padding:32, textAlign:'center', color:'#94a3b8' }}>No audit log entries</td></tr>
            )}
            {loading && (
              <tr><td colSpan={4} style={{ padding:32, textAlign:'center', color:'#94a3b8' }}>Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
