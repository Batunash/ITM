import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

const STATUS_COLORS = { Open: '#3b82f6', Pending: '#f59e0b', Resolved: '#10b981', Closed: '#6b7280', InProgress: '#8b5cf6', Assigned: '#06b6d4' };
const PRIORITY_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#3b82f6', Low: '#22c55e' };

const StatusBadge = ({ status }) => {
  const colors = { Open: '#3b82f6', Pending: '#f59e0b', Resolved: '#10b981', Closed: '#6b7280', InProgress: '#8b5cf6', Assigned: '#06b6d4' };
  return (
    <span style={{ background: (colors[status] || '#94a3b8') + '20', color: colors[status] || '#94a3b8', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = { Critical: '#ef4444', High: '#f97316', Medium: '#3b82f6', Low: '#22c55e' };
  return (
    <span style={{ background: (colors[priority] || '#94a3b8') + '20', color: colors[priority] || '#94a3b8', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
      {priority}
    </span>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/dashboard/recent-tickets?limit=5').then(r => setRecent(r.data)).catch(() => {});
  }, []);

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>System Overview</h1>
          <p style={styles.pageSubtitle}>Real-time operational health and infrastructure monitoring.</p>
        </div>
        <span style={{ ...styles.timeFilter, cursor:'default' }}>Live Data</span>
      </div>

      {}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>ACTIVE TICKETS</div>
          <div style={styles.kpiValue}>{stats?.openTickets ?? '—'}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>ASSETS IN MAINTENANCE</div>
          <div style={styles.kpiValue}>{stats?.pendingAssets ?? '—'}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>ACTIVE AGENTS</div>
          <div style={styles.kpiValue}>{stats?.activeAgents ?? '—'}</div>
        </div>
      </div>

      {}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartTitle}>Ticket Priority Distribution</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.ticketsByPriority ?? []} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {(stats?.ticketsByPriority ?? []).map((entry, index) => (
                    <Cell key={index} fill={PRIORITY_COLORS[entry.priority] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#374151' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartTitle}>Tickets by Status</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width={180} height={200}>
              <PieChart>
                <Pie data={stats?.ticketsByStatus ?? []} dataKey="count" nameKey="status" innerRadius={55} outerRadius={80}>
                  {(stats?.ticketsByStatus ?? []).map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.legend}>
              {(stats?.ticketsByStatus ?? []).map((entry, i) => (
                <div key={i} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: STATUS_COLORS[entry.status] || '#94a3b8' }} />
                  <span style={styles.legendLabel}>{entry.status}</span>
                  <span style={styles.legendCount}>{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <span style={styles.chartTitle}>Recent Incident Tickets</span>
          <Link to="/tickets" style={styles.viewAll}>View All Tickets</Link>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              {['ID', 'Subject', 'Assignee', 'Status', 'Priority'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(ticket => (
              <tr key={ticket.id} style={styles.tr}>
                <td style={styles.td}><span style={styles.ticketId}>#INC-{ticket.id}</span></td>
                <td style={styles.td}>{ticket.title}</td>
                <td style={styles.td}>{ticket.assignedTo || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                <td style={styles.td}><StatusBadge status={ticket.status} /></td>
                <td style={styles.td}><PriorityBadge priority={ticket.priority} /></td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>No tickets yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' },
  pageSubtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  timeFilter: { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13, color: '#374151' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  kpiCard: { background: '#fff', borderRadius: 4, padding: 20, border: '1px solid #e2e8f0' },
  kpiLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 8 },
  kpiValue: { fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1 },
  kpiTrend: { fontSize: 13, color: '#10b981', marginTop: 4 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  chartCard: { background: '#fff', borderRadius: 4, padding: 20, border: '1px solid #e2e8f0' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a' },
  legend: { flex: 1, paddingLeft: 16 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 13, color: '#374151', flex: 1 },
  legendCount: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  tableCard: { background: '#fff', borderRadius: 4, padding: 20, border: '1px solid #e2e8f0' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAll: { fontSize: 13, color: '#334155', textDecoration: 'none', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '2px solid #f1f5f9', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '12px 12px', fontSize: 14, color: '#374151' },
  ticketId: { fontWeight: 700, color: '#334155' },
};
