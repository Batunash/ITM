import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',        label: 'Dashboard',        permissions: [] },
  { to: '/tickets',          label: 'Tickets',          permissions: ['ViewTickets'] },
  { to: '/assets',           label: 'Assets',           permissions: ['ManageAssets'] },
  { to: '/users',            label: 'Users',            permissions: ['ManageUsers'] },
  { to: '/change-requests',  label: 'Change Requests',  permissions: [] },
  { to: '/sla',              label: 'SLA',              permissions: ['ViewReports'] },
  { to: '/customer-history', label: 'Customer History', permissions: ['ViewReports'] },
  { to: '/reports',          label: 'Reports',          permissions: ['ViewReports'] },
  { to: '/audit-logs',       label: 'Audit Logs',       permissions: ['ViewAuditLogs'] },
  { to: '/roles',            label: 'Role Management',  permissions: ['ManageSettings'] },
  { to: '/settings',         label: 'Settings',         permissions: ['ManageSettings'] },
  { to: '/backup',           label: 'Backup',           permissions: ['ManageSettings'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visible = navItems.filter(item =>
    item.permissions.length === 0 ||
    item.permissions.some(p => user?.permissions?.includes(p))
  );

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🛡</div>
        <div>
          <div style={styles.logoTitle}>ITSM Portal</div>
          <div style={styles.logoSub}>Enterprise Service Management</div>
        </div>
      </div>
      <nav style={styles.nav}>
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              backgroundColor: isActive ? '#334155' : 'transparent',
              color: isActive ? '#fff' : '#94a3b8',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.fullName?.[0] ?? 'U'}</div>
          <div>
            <div style={styles.userName}>{user?.fullName}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: { width: 240, background: '#0f172a', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px', borderBottom: '1px solid #1e293b' },
  logoIcon: { fontSize: 24, background: '#334155', borderRadius: 4, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoTitle: { color: '#fff', fontWeight: 700, fontSize: 14 },
  logoSub: { color: '#64748b', fontSize: 11 },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: { display: 'block', padding: '10px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.15s' },
  footer: { padding: 16, borderTop: '1px solid #1e293b' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#334155', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 },
  userName: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
  userRole: { color: '#64748b', fontSize: 11 },
  logoutBtn: { width: '100%', padding: '8px', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
};
