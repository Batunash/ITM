import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ROLE_STYLES = {
  EndUser:        { bg:'#f1f5f9', color:'#475569' },
  ITSupportAgent: { bg:'#dbeafe', color:'#1d4ed8' },
  ITManager:      { bg:'#ede9fe', color:'#7c3aed' },
  SystemAdmin:    { bg:'#fee2e2', color:'#dc2626' },
};

const RoleBadge = ({ role }) => {
  const st = ROLE_STYLES[role] || { bg:'#f1f5f9', color:'#475569' };
  return <span style={{ background:st.bg, color:st.color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{role}</span>;
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
  box: { background:'#fff', borderRadius:14, width:460, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #f1f5f9' },
  title: { fontWeight:700, fontSize:16, color:'#0f172a' },
  x: { background:'none', border:'none', fontSize:24, cursor:'pointer', color:'#64748b', lineHeight:1, padding:0 },
  body: { padding:24 },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ fullName:'', email:'', password:'', roleId:'' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName:'', email:'', roleId:'' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'SystemAdmin';

  useEffect(() => {
    api.get('/users').then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    if (isAdmin) {
      api.get('/roles').then(r => setRoles(Array.isArray(r.data) ? r.data : [])).catch(() => {
        // fallback static roles if endpoint fails
        setRoles([{id:1,name:'EndUser'},{id:2,name:'ITSupportAgent'},{id:3,name:'ITManager'},{id:4,name:'SystemAdmin'}]);
      });
    }
  }, []);

  /* ── Add user ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true); setAddError('');
    try {
      const { data } = await api.post('/users', {
        fullName: addForm.fullName,
        email: addForm.email,
        password: addForm.password,
        roleId: parseInt(addForm.roleId),
      });
      setUsers(p => [data, ...p]);
      setShowAdd(false); setAddForm({ fullName:'', email:'', password:'', roleId:'' });
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create user.');
    } finally { setAddLoading(false); }
  };

  /* ── Edit user ── */
  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ fullName:u.fullName, email:u.email, roleId: roles.find(r => r.name === u.role)?.id || '' });
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true); setEditError('');
    try {
      const { data } = await api.put(`/users/${editUser.id}`, {
        fullName: editForm.fullName,
        email: editForm.email,
        roleId: parseInt(editForm.roleId),
      });
      setUsers(p => p.map(u => u.id === editUser.id ? data : u));
      setEditUser(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update user.');
    } finally { setEditLoading(false); }
  };

  /* ── Delete user ── */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deleteConfirm.id}`);
      setUsers(p => p.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch { alert('Failed to delete user.'); }
    finally { setDeleteLoading(false); }
  };

  const roleOptions = roles.length ? roles : [
    {id:1,name:'EndUser'},{id:2,name:'ITSupportAgent'},{id:3,name:'ITManager'},{id:4,name:'SystemAdmin'}
  ];

  return (
    <Layout>
      {/* Add User Modal */}
      {showAdd && (
        <Modal title="Add New User" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {addError && <div style={f.err}>{addError}</div>}
            <div>
              <label style={f.lbl}>Full Name</label>
              <input style={f.inp} placeholder="John Smith" value={addForm.fullName}
                onChange={e => setAddForm({...addForm, fullName:e.target.value})} required autoFocus />
            </div>
            <div>
              <label style={f.lbl}>Email</label>
              <input style={f.inp} type="email" placeholder="john@company.com" value={addForm.email}
                onChange={e => setAddForm({...addForm, email:e.target.value})} required />
            </div>
            <div>
              <label style={f.lbl}>Password</label>
              <input style={f.inp} type="password" placeholder="Min. 8 characters" value={addForm.password}
                onChange={e => setAddForm({...addForm, password:e.target.value})} required minLength={8} />
            </div>
            <div>
              <label style={f.lbl}>Role</label>
              <select style={f.inp} value={addForm.roleId} onChange={e => setAddForm({...addForm, roleId:e.target.value})} required>
                <option value="">Select role...</option>
                {roleOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={f.row}>
              <button type="button" style={f.cancel} onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" style={f.submit} disabled={addLoading}>{addLoading ? 'Creating...' : 'Create User'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <Modal title={`Edit — ${editUser.fullName}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleEdit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {editError && <div style={f.err}>{editError}</div>}
            <div>
              <label style={f.lbl}>Full Name</label>
              <input style={f.inp} value={editForm.fullName}
                onChange={e => setEditForm({...editForm, fullName:e.target.value})} required autoFocus />
            </div>
            <div>
              <label style={f.lbl}>Email</label>
              <input style={f.inp} type="email" value={editForm.email}
                onChange={e => setEditForm({...editForm, email:e.target.value})} required />
            </div>
            <div>
              <label style={f.lbl}>Role</label>
              <select style={f.inp} value={editForm.roleId} onChange={e => setEditForm({...editForm, roleId:e.target.value})} required>
                <option value="">Select role...</option>
                {roleOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={f.row}>
              <button type="button" style={f.cancel} onClick={() => setEditUser(null)}>Cancel</button>
              <button type="submit" style={f.submit} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <Modal title="Delete User" onClose={() => setDeleteConfirm(null)}>
          <p style={{margin:'0 0 20px', color:'#374151', fontSize:14}}>
            Are you sure you want to delete <strong>{deleteConfirm.fullName}</strong>? This action cannot be undone.
          </p>
          <div style={f.row}>
            <button style={f.cancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button style={{...f.submit, background:'#dc2626'}} disabled={deleteLoading} onClick={handleDelete}>
              {deleteLoading ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </Modal>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>User Management</h1>
          <p style={s.subtitle}>Manage system user accounts and roles.</p>
        </div>
        {isAdmin && (
          <button style={s.addBtn} onClick={() => setShowAdd(true)}>+ Add User</button>
        )}
      </div>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>{['ID','Full Name','Email','Role','Created At','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={s.tr}>
                <td style={s.td}>{u.id}</td>
                <td style={{...s.td, fontWeight:600}}>{u.fullName}</td>
                <td style={{...s.td, color:'#64748b'}}>{u.email}</td>
                <td style={s.td}><RoleBadge role={u.role} /></td>
                <td style={{...s.td, color:'#94a3b8'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{...s.td, display:'flex', gap:8}}>
                  {isAdmin && (
                    <>
                      <button style={s.editBtn} onClick={() => openEdit(u)}>Edit</button>
                      {u.id !== currentUser?.userId && (
                        <button style={s.deleteBtn} onClick={() => setDeleteConfirm(u)}>Delete</button>
                      )}
                    </>
                  )}
                  {!isAdmin && <span style={{color:'#94a3b8', fontSize:13}}>—</span>}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:32}}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const f = {
  lbl: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  inp: { width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' },
  err: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:13 },
  row: { display:'flex', gap:10, marginTop:4 },
  cancel: { flex:1, padding:'10px', background:'#f1f5f9', color:'#374151', border:'none', borderRadius:8, fontSize:14, cursor:'pointer' },
  submit: { flex:2, padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:14, cursor:'pointer', fontWeight:600 },
};
const s = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  pageTitle: { margin:0, fontSize:22, fontWeight:700, color:'#0f172a' },
  subtitle: { margin:'4px 0 0', color:'#64748b', fontSize:14 },
  addBtn: { background:'#2563eb', color:'#fff', border:'none', padding:'10px 18px', borderRadius:8, cursor:'pointer', fontWeight:600 },
  tableCard: { background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'12px 16px', fontSize:12, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f8fafc' },
  td: { padding:'12px 16px', fontSize:14, color:'#374151' },
  editBtn: { background:'none', border:'1px solid #e2e8f0', borderRadius:6, padding:'5px 12px', fontSize:13, cursor:'pointer', color:'#374151' },
  deleteBtn: { background:'none', border:'1px solid #fecaca', borderRadius:6, padding:'5px 12px', fontSize:13, cursor:'pointer', color:'#dc2626' },
};
