import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';

const ALL_PERMISSIONS = [
  { id:1, name:'ViewTickets' }, { id:2, name:'CreateTicket' }, { id:3, name:'AssignTicket' },
  { id:4, name:'CloseTicket' }, { id:5, name:'ManageUsers' }, { id:6, name:'ManageAssets' },
  { id:7, name:'ViewReports' }, { id:8, name:'ViewAuditLogs' }, { id:9, name:'ManageSettings' },
];

const ROLE_COLORS = {
  EndUser:'#475569', ITSupportAgent:'#1d4ed8', ITManager:'#7c3aed', SystemAdmin:'#dc2626',
};

function Modal({ title, onClose, children }) {
  return (
    <div style={m.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={m.box}>
        <div style={m.head}>
          <span style={m.title}>{title}</span>
          <button style={m.x} onClick={onClose}>×</button>
        </div>
        <div style={m.body}>{children}</div>
      </div>
    </div>
  );
}
const m = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  box: { background:'#fff', borderRadius:14, width:500, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' },
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #f1f5f9', position:'sticky', top:0, background:'#fff' },
  title: { fontWeight:700, fontSize:16, color:'#0f172a' },
  x: { background:'none', border:'none', fontSize:24, cursor:'pointer', color:'#64748b', lineHeight:1, padding:0 },
  body: { padding:24 },
};

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [permMap, setPermMap] = useState({}); // roleId -> [Permission]
  const [expandedRole, setExpandedRole] = useState(null);

  const [assignModal, setAssignModal] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const [addPermModal, setAddPermModal] = useState(null); // roleId
  const [addPermId, setAddPermId] = useState('');
  const [addPermLoading, setAddPermLoading] = useState(false);
  const [addPermError, setAddPermError] = useState('');
  const [removingPerm, setRemovingPerm] = useState(null); // `${roleId}-${permId}`

  useEffect(() => {
    api.get('/roles').then(r => {
      const list = Array.isArray(r.data) ? r.data : [];
      setRoles(list);
      list.forEach(role => {
        api.get(`/roles/${role.id}/permissions`).then(pr => {
          setPermMap(prev => ({ ...prev, [role.id]: Array.isArray(pr.data) ? pr.data : [] }));
        }).catch(() => {});
      });
    }).catch(() => {});
    api.get('/users').then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const handleAssignRole = async (e) => {
    e.preventDefault();
    setAssignLoading(true); setAssignError(''); setAssignSuccess('');
    try {
      await api.put(`/roles/assign?userId=${assignUserId}&roleId=${assignRoleId}`);
      const role = roles.find(r => r.id === parseInt(assignRoleId));
      setUsers(prev => prev.map(u => u.id === parseInt(assignUserId) ? { ...u, role: role?.name ?? u.role } : u));
      setAssignSuccess('Role assigned successfully.');
      setAssignUserId(''); setAssignRoleId('');
    } catch {
      setAssignError('Failed to assign role.');
    } finally { setAssignLoading(false); }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    if (!addPermId || !addPermModal) return;
    setAddPermLoading(true); setAddPermError('');
    try {
      await api.post(`/roles/${addPermModal}/permissions/${addPermId}`);
      const perm = ALL_PERMISSIONS.find(p => p.id === parseInt(addPermId));
      if (perm) {
        setPermMap(prev => ({
          ...prev,
          [addPermModal]: [...(prev[addPermModal] || []), perm]
        }));
      }
      setAddPermModal(null); setAddPermId('');
    } catch {
      setAddPermError('Failed to add permission. It may already be assigned.');
    } finally { setAddPermLoading(false); }
  };

  const handleRemovePermission = async (roleId, permId) => {
    const key = `${roleId}-${permId}`;
    setRemovingPerm(key);
    try {
      await api.delete(`/roles/${roleId}/permissions/${permId}`);
      setPermMap(prev => ({
        ...prev,
        [roleId]: (prev[roleId] || []).filter(p => p.id !== permId)
      }));
    } catch {
      alert('Failed to remove permission.');
    } finally { setRemovingPerm(null); }
  };

  return (
    <Layout>
      {/* Assign Role Modal */}
      {assignModal && (
        <Modal title="Assign Role to User" onClose={() => { setAssignModal(false); setAssignError(''); setAssignSuccess(''); }}>
          <form onSubmit={handleAssignRole} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {assignError && <div style={f.err}>{assignError}</div>}
            {assignSuccess && <div style={f.ok}>{assignSuccess}</div>}
            <div>
              <label style={f.lbl}>User</label>
              <select style={f.inp} value={assignUserId} onChange={e => setAssignUserId(e.target.value)} required autoFocus>
                <option value="">Select user...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName} — current: {u.role}</option>)}
              </select>
            </div>
            <div>
              <label style={f.lbl}>New Role</label>
              <select style={f.inp} value={assignRoleId} onChange={e => setAssignRoleId(e.target.value)} required>
                <option value="">Select role...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={f.row}>
              <button type="button" style={f.cancel} onClick={() => setAssignModal(false)}>Cancel</button>
              <button type="submit" style={f.submit} disabled={assignLoading}>{assignLoading ? 'Assigning...' : 'Assign Role'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Permission Modal */}
      {addPermModal && (
        <Modal title="Add Permission to Role" onClose={() => { setAddPermModal(null); setAddPermError(''); }}>
          <form onSubmit={handleAddPermission} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {addPermError && <div style={f.err}>{addPermError}</div>}
            <div>
              <label style={f.lbl}>Permission</label>
              <select style={f.inp} value={addPermId} onChange={e => setAddPermId(e.target.value)} required autoFocus>
                <option value="">Select permission...</option>
                {ALL_PERMISSIONS
                  .filter(p => !(permMap[addPermModal] ?? []).some(ex => ex.id === p.id))
                  .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={f.row}>
              <button type="button" style={f.cancel} onClick={() => setAddPermModal(null)}>Cancel</button>
              <button type="submit" style={f.submit} disabled={addPermLoading}>{addPermLoading ? 'Adding...' : 'Add Permission'}</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Role Management</h1>
          <p style={s.subtitle}>Manage system roles and their permissions.</p>
        </div>
        <button style={s.assignBtn} onClick={() => setAssignModal(true)}>👤 Assign Role to User</button>
      </div>

      <div style={s.grid}>
        {roles.map(role => {
          const perms = permMap[role.id] || [];
          const color = ROLE_COLORS[role.name] || '#475569';
          const isExpanded = expandedRole === role.id;
          return (
            <div key={role.id} style={s.roleCard}>
              <div style={s.roleHead}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ ...s.roleIcon, background: color + '20', color }}>{role.name[0]}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>{role.name}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>{perms.length} permission{perms.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <button style={s.expandBtn} onClick={() => setExpandedRole(isExpanded ? null : role.id)}>
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>
              {isExpanded && (
                <div style={s.roleBody}>
                  <div style={s.permList}>
                    {perms.length === 0 && <span style={{ color:'#94a3b8', fontSize:13 }}>No permissions assigned</span>}
                    {perms.map(p => {
                      const key = `${role.id}-${p.id}`;
                      const removing = removingPerm === key;
                      return (
                        <span key={p.id} style={{ ...s.permTag, opacity: removing ? 0.5 : 1 }}>
                          {p.name}
                          <button
                            onClick={() => handleRemovePermission(role.id, p.id)}
                            disabled={removing}
                            title="Remove permission"
                            style={{ background:'none', border:'none', cursor:'pointer', color:'#2563eb', marginLeft:4, padding:'0 2px', fontSize:13, lineHeight:1, fontWeight:700 }}>
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <button style={s.addPermBtn} onClick={() => { setAddPermModal(role.id); setAddPermError(''); setAddPermId(''); }}>
                    + Add Permission
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Users with their roles */}
      <div style={{ marginTop:24 }}>
        <h2 style={{ margin:'0 0 16px', fontSize:17, fontWeight:700, color:'#0f172a' }}>User Role Assignments</h2>
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead>
              <tr>{['User','Email','Current Role'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.map(u => {
                const color = ROLE_COLORS[u.role] || '#475569';
                return (
                  <tr key={u.id} style={s.tr}>
                    <td style={{...s.td, fontWeight:600}}>{u.fullName}</td>
                    <td style={{...s.td, color:'#64748b'}}>{u.email}</td>
                    <td style={s.td}>
                      <span style={{ background: color + '20', color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{u.role}</span>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={3} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:32}}>No users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

const f = {
  lbl: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  inp: { width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' },
  err: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13 },
  ok:  { background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'10px 14px', borderRadius:8, fontSize:13 },
  row: { display:'flex', gap:10, marginTop:4 },
  cancel: { flex:1, padding:'10px', background:'#f1f5f9', color:'#374151', border:'none', borderRadius:8, fontSize:14, cursor:'pointer' },
  submit: { flex:2, padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:14, cursor:'pointer', fontWeight:600 },
};
const s = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  pageTitle: { margin:0, fontSize:22, fontWeight:700, color:'#0f172a' },
  subtitle: { margin:'4px 0 0', color:'#64748b', fontSize:14 },
  assignBtn: { background:'#2563eb', color:'#fff', border:'none', padding:'10px 18px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' },
  grid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginBottom:8 },
  roleCard: { background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' },
  roleHead: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px' },
  roleIcon: { width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700 },
  expandBtn: { background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:14 },
  roleBody: { borderTop:'1px solid #f1f5f9', padding:'14px 20px', display:'flex', flexDirection:'column', gap:12 },
  permList: { display:'flex', flexWrap:'wrap', gap:8 },
  permTag: { background:'#eff6ff', color:'#2563eb', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
  addPermBtn: { alignSelf:'flex-start', background:'none', border:'1px dashed #cbd5e1', borderRadius:8, padding:'6px 14px', fontSize:13, color:'#64748b', cursor:'pointer' },
  tableCard: { background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f8fafc' },
  td: { padding:'12px 16px', fontSize:14, color:'#374151' },
};
