import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

const PRIORITY_COLORS = { Critical:'#ef4444', High:'#f97316', Medium:'#3b82f6', Low:'#22c55e' };
const STATUS_COLORS = { Open:'#3b82f6', Pending:'#f59e0b', Resolved:'#10b981', Closed:'#6b7280', InProgress:'#8b5cf6', Assigned:'#06b6d4' };

const Badge = ({ text, colorMap }) => {
  const color = (colorMap && colorMap[text]) || '#94a3b8';
  return <span style={{ background: color+'20', color, padding:'3px 10px', borderRadius: 4, fontSize:12, fontWeight:600 }}>{text}</span>;
};

function formatHours(hours) {
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24 > 0 ? `${hours % 24}h` : ''}`.trim();
}

export default function SlaPage() {
  const [slas, setSlas] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/sla').then(r => setSlas(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
      api.get('/sla/violations').then(r => setViolations(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>SLA Management</h1>
          <p style={s.subtitle}>Monitor service level agreements and identify breached tickets.</p>
        </div>
        <div style={s.violationBadge}>
          {violations.length > 0
            ? <span style={s.violationAlert}>⚠ {violations.length} SLA violation{violations.length !== 1 ? 's' : ''}</span>
            : <span style={s.violationOk}>✓ All within SLA</span>}
        </div>
      </div>

      {loading ? (
        <div style={s.loading}>Loading SLA data...</div>
      ) : (
        <>
          {/* SLA Policies */}
          <div style={s.grid}>
            {slas.map(sla => {
              const color = PRIORITY_COLORS[sla.priority] || '#94a3b8';
              return (
                <div key={sla.id} style={s.slaCard}>
                  <div style={{ ...s.priorityBar, background: color }} />
                  <div style={s.slaBody}>
                    <div style={{ ...s.priorityLabel, color }}>{sla.priority}</div>
                    <div style={s.targetHours}>{formatHours(sla.targetResolutionHours)}</div>
                    <div style={s.targetLabel}>Target Resolution Time</div>
                  </div>
                </div>
              );
            })}
          </div>

          {}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>SLA Violations</span>
              <span style={{
                background: violations.length > 0 ? '#fef2f2' : '#f0fdf4',
                color: violations.length > 0 ? '#dc2626' : '#16a34a',
                padding:'3px 10px', borderRadius: 4, fontSize:12, fontWeight:600
              }}>
                {violations.length} ticket{violations.length !== 1 ? 's' : ''}
              </span>
            </div>
            {violations.length === 0 ? (
              <div style={s.okState}>
                <div style={s.okIcon}>✓</div>
                <div style={s.okText}>No SLA violations detected. All active tickets are within their target resolution times.</div>
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>{['Ticket ID','Title','Priority','Status','Assigned To','Created'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {violations.map(t => {
                    const elapsedHours = Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 3600000);
                    const sla = slas.find(s => s.priority === t.priority);
                    const overBy = sla ? elapsedHours - sla.targetResolutionHours : null;
                    return (
                      <tr key={t.id} style={{ ...s.tr, background:'#fef2f220' }}>
                        <td style={s.td}><span style={s.ticketId}>INC-{t.id}</span></td>
                        <td style={s.td}>{t.title}</td>
                        <td style={s.td}><Badge text={t.priority} colorMap={PRIORITY_COLORS} /></td>
                        <td style={s.td}><Badge text={t.status} colorMap={STATUS_COLORS} /></td>
                        <td style={s.td}>{t.assignedTo || <span style={{color:'#94a3b8'}}>Unassigned</span>}</td>
                        <td style={s.td}>
                          <div style={{color:'#374151'}}>{new Date(t.createdAt).toLocaleDateString()}</div>
                          {overBy !== null && overBy > 0 && (
                            <div style={{fontSize:11, color:'#dc2626', fontWeight:600, marginTop:2}}>
                              +{formatHours(overBy)} over SLA
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

const s = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  pageTitle: { margin:0, fontSize:22, fontWeight:700, color:'#0f172a' },
  subtitle: { margin:'4px 0 0', color:'#64748b', fontSize:14 },
  violationBadge: { paddingTop:4 },
  violationAlert: { background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', padding:'8px 14px', borderRadius: 4, fontSize:13, fontWeight:700 },
  violationOk: { background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', padding:'8px 14px', borderRadius: 4, fontSize:13, fontWeight:700 },
  loading: { color:'#64748b', fontSize:14, padding:20 },
  grid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  slaCard: { background:'#fff', borderRadius: 4, border:'1px solid #e2e8f0', overflow:'hidden', display:'flex', flexDirection:'column' },
  priorityBar: { height:4 },
  slaBody: { padding:'18px 20px' },
  priorityLabel: { fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 },
  targetHours: { fontSize:32, fontWeight:800, color:'#0f172a', lineHeight:1, marginBottom:4 },
  targetLabel: { fontSize:12, color:'#94a3b8' },
  card: { background:'#fff', borderRadius: 4, border:'1px solid #e2e8f0', overflow:'hidden' },
  cardHead: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' },
  cardTitle: { fontSize:15, fontWeight:700, color:'#0f172a' },
  okState: { display:'flex', alignItems:'center', gap:16, padding:'24px 20px' },
  okIcon: { width:40, height:40, borderRadius:'50%', background:'#f0fdf4', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 },
  okText: { fontSize:14, color:'#64748b' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f8fafc' },
  td: { padding:'12px 16px', fontSize:14, color:'#374151' },
  ticketId: { fontWeight:700, color:'#64748b', fontSize:13 },
};
