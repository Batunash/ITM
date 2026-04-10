import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const ASSET_TYPES = [
  { id: 1, name: 'Laptop' }, { id: 2, name: 'Monitor' }, { id: 3, name: 'Mobile' },
  { id: 4, name: 'Peripheral' }, { id: 5, name: 'Server' },
];
const STATUS_COLORS = { InStorage: '#22c55e', InUse: '#3b82f6', Maintenance: '#f59e0b' };

const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status] || '#94a3b8';
  return <span style={{ color, fontWeight: 600, fontSize: 13 }}>● {status}</span>;
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
  box: { background:'#fff', borderRadius:14, width:440, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #f1f5f9' },
  title: { fontWeight:700, fontSize:16, color:'#0f172a' },
  x: { background:'none', border:'none', fontSize:24, cursor:'pointer', color:'#64748b', lineHeight:1, padding:0 },
  body: { padding:24 },
};

export default function AssetManagementPage() {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total:0, inUse:0, inStorage:0, maintenance:0 });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ assetName:'', assetTypeId:'' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const [assignModal, setAssignModal] = useState({ open:false, assetId:null, assetName:'' });
  const [assignUserId, setAssignUserId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  const [openMenu, setOpenMenu] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const { user } = useAuth();
  const canManage = ['ITManager','SystemAdmin'].includes(user?.role);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/assets').then(r => {
      const all = Array.isArray(r.data) ? r.data : [];
      setAssets(all);
      recalcSummary(all);
    }).catch(() => {});
    if (canManage) {
      api.get('/users').then(r => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    }
  }, []);

  const recalcSummary = (all) => setSummary({
    total: all.length,
    inUse: all.filter(a => a.status === 'InUse').length,
    inStorage: all.filter(a => a.status === 'InStorage').length,
    maintenance: all.filter(a => a.status === 'Maintenance').length,
  });

  const paged = assets.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.ceil(assets.length / pageSize);

  /* ── Add asset ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true); setAddError('');
    try {
      const { data } = await api.post('/assets', { assetName: addForm.assetName, assetTypeId: parseInt(addForm.assetTypeId) });
      const updated = [data, ...assets];
      setAssets(updated); recalcSummary(updated);
      setShowAdd(false); setAddForm({ assetName:'', assetTypeId:'' });
    } catch { setAddError('Failed to add asset. Please try again.'); }
    finally { setAddLoading(false); }
  };

  /* ── Assign asset ── */
  const openAssign = (assetId, assetName) => {
    setAssignModal({ open:true, assetId, assetName });
    setAssignUserId(''); setAssignError(''); setOpenMenu(null);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignLoading(true); setAssignError('');
    try {
      await api.post(`/assets/${assignModal.assetId}/assign`, { userId: parseInt(assignUserId) });
      const assignedUser = users.find(u => u.id === parseInt(assignUserId));
      const updated = assets.map(a =>
        a.id === assignModal.assetId ? { ...a, status:'InUse', assignedTo: assignedUser?.fullName ?? 'User' } : a
      );
      setAssets(updated); recalcSummary(updated);
      setAssignModal({ open:false, assetId:null, assetName:'' });
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Assignment failed. Asset may already be in use.');
    } finally { setAssignLoading(false); }
  };

  /* ── Change asset status ── */
  // Status IDs from seed: InStorage=7, InUse=8, Maintenance=9
  const STATUS_IDS = { InStorage: 7, InUse: 8, Maintenance: 9 };
  const handleStatusChange = async (assetId, statusId, statusName) => {
    setStatusLoading(assetId); setOpenMenu(null);
    try {
      await api.put(`/assets/${assetId}/status`, { statusId });
      const updated = assets.map(a =>
        a.id === assetId ? { ...a, status: statusName, assignedTo: statusName === 'InStorage' ? null : a.assignedTo } : a
      );
      setAssets(updated); recalcSummary(updated);
    } catch {
      alert('Failed to update asset status.');
    } finally { setStatusLoading(null); }
  };

  /* ── CSV export ── */
  const exportCsv = () => {
    const rows = ['ID,Asset Name,Type,Assigned User,Status',
      ...assets.map(a => `${a.id},${a.assetName},${a.assetType},${a.assignedTo||'Unassigned'},${a.status}`)
    ].join('\n');
    const url = URL.createObjectURL(new Blob([rows], { type:'text/csv' }));
    Object.assign(document.createElement('a'), { href:url, download:'assets.csv' }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      {/* Add Asset Modal */}
      {showAdd && (
        <Modal title="Add New Asset" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {addError && <div style={f.err}>{addError}</div>}
            <div>
              <label style={f.lbl}>Asset Name</label>
              <input style={f.inp} placeholder="e.g., MacBook Pro 14" value={addForm.assetName}
                onChange={e => setAddForm({...addForm, assetName:e.target.value})} required autoFocus />
            </div>
            <div>
              <label style={f.lbl}>Asset Type</label>
              <select style={f.inp} value={addForm.assetTypeId}
                onChange={e => setAddForm({...addForm, assetTypeId:e.target.value})} required>
                <option value="">Select type...</option>
                {ASSET_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={f.row}>
              <button type="button" style={f.cancel} onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" style={f.submit} disabled={addLoading}>{addLoading ? 'Adding...' : 'Add Asset'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Asset Modal */}
      {assignModal.open && (
        <Modal title={`Assign — ${assignModal.assetName || 'Asset'}`} onClose={() => setAssignModal({open:false,assetId:null,assetName:''})}>
          <form onSubmit={handleAssign} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {assignError && <div style={f.err}>{assignError}</div>}
            {!assignModal.assetId && (
              <div>
                <label style={f.lbl}>Asset</label>
                <select style={f.inp} value={assignModal.assetId || ''}
                  onChange={e => setAssignModal(prev => ({...prev, assetId: parseInt(e.target.value), assetName: assets.find(a=>a.id===parseInt(e.target.value))?.assetName||''}))}>
                  <option value="">Select asset...</option>
                  {assets.filter(a => a.status === 'InStorage').map(a => <option key={a.id} value={a.id}>{a.assetName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={f.lbl}>Assign To</label>
              <select style={f.inp} value={assignUserId} onChange={e => setAssignUserId(e.target.value)} required autoFocus>
                <option value="">Select user...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
              </select>
            </div>
            <div style={f.row}>
              <button type="button" style={f.cancel} onClick={() => setAssignModal({open:false,assetId:null,assetName:''})}>Cancel</button>
              <button type="submit" style={f.submit} disabled={assignLoading || !assignUserId || !assignModal.assetId}>{assignLoading ? 'Assigning...' : 'Assign Asset'}</button>
            </div>
          </form>
        </Modal>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Hardware Assets</h1>
          <p style={s.subtitle}>Manage and track your organization's physical device inventory.</p>
        </div>
        {canManage && (
          <button style={s.assignBtn} onClick={() => setAssignModal({open:true,assetId:null,assetName:''})}>
            👤 Assign Asset
          </button>
        )}
      </div>

      <div style={s.summaryRow}>
        {[
          { label:'TOTAL ASSETS', value:summary.total, color:'#0f172a' },
          { label:'IN USE', value:summary.inUse, color:'#3b82f6' },
          { label:'IN STORAGE', value:summary.inStorage, color:'#22c55e' },
          { label:'MAINTENANCE', value:summary.maintenance, color:'#f59e0b' },
        ].map(c => (
          <div key={c.label} style={s.summaryCard}>
            <div style={s.summaryLabel}>{c.label}</div>
            <div style={{...s.summaryValue, color:c.color}}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={s.tableCard} onClick={() => setOpenMenu(null)}>
        <table style={s.table}>
          <thead>
            <tr>{['ASSET NAME','TYPE','ASSIGNED USER','STATUS','ACTIONS'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {paged.map(asset => (
              <tr key={asset.id} style={s.tr}>
                <td style={s.td}>
                  <div style={s.assetName}>{asset.assetName}</div>
                  <div style={s.assetId}>ID: {asset.id}</div>
                </td>
                <td style={s.td}>{asset.assetType}</td>
                <td style={s.td}>
                  {asset.assignedTo
                    ? <span style={s.userBadge}>{asset.assignedTo}</span>
                    : <span style={{color:'#94a3b8'}}>Unassigned</span>}
                </td>
                <td style={s.td}><StatusBadge status={asset.status} /></td>
                <td style={s.td}>
                  <div style={{position:'relative',display:'inline-block'}}>
                    <button style={s.menuBtn} onClick={e => { e.stopPropagation(); setOpenMenu(openMenu===asset.id ? null : asset.id); }}>⋮</button>
                    {openMenu === asset.id && (
                      <div style={s.dropdown} onClick={e => e.stopPropagation()}>
                        {statusLoading === asset.id ? (
                          <div style={{...s.dropItem, color:'#94a3b8', cursor:'default'}}>Updating...</div>
                        ) : (
                          <>
                            {asset.status === 'InStorage' && canManage && (
                              <>
                                <button style={s.dropItem} onClick={() => openAssign(asset.id, asset.assetName)}>👤 Assign User</button>
                                <button style={s.dropItem} onClick={() => handleStatusChange(asset.id, STATUS_IDS.Maintenance, 'Maintenance')}>🔧 Set to Maintenance</button>
                              </>
                            )}
                            {asset.status === 'InUse' && canManage && (
                              <>
                                <button style={s.dropItem} onClick={() => handleStatusChange(asset.id, STATUS_IDS.InStorage, 'InStorage')}>📦 Return to Storage</button>
                                <button style={s.dropItem} onClick={() => handleStatusChange(asset.id, STATUS_IDS.Maintenance, 'Maintenance')}>🔧 Set to Maintenance</button>
                              </>
                            )}
                            {asset.status === 'Maintenance' && canManage && (
                              <>
                                <button style={s.dropItem} onClick={() => handleStatusChange(asset.id, STATUS_IDS.InStorage, 'InStorage')}>📦 Return to Storage</button>
                                <button style={s.dropItem} onClick={() => handleStatusChange(asset.id, STATUS_IDS.InUse, 'InUse')}>✅ Set to In Use</button>
                              </>
                            )}
                            {!canManage && (
                              <div style={{...s.dropItem, color:'#94a3b8', cursor:'default'}}>No actions available</div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={5} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:32}}>No assets found</td></tr>
            )}
          </tbody>
        </table>
        <div style={s.pagination}>
          <span style={s.pagingInfo}>
            {assets.length === 0 ? 'No assets' : `Showing ${(page-1)*pageSize+1}–${Math.min(page*pageSize,assets.length)} of ${assets.length}`}
          </span>
          <div style={s.pagingBtns}>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
              <button key={p} style={{...s.pageBtn, background:p===page?'#2563eb':'#f1f5f9', color:p===page?'#fff':'#374151'}} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={s.actionRow}>
        <button style={s.actionBtn} onClick={exportCsv}>⬇ Export CSV <br/><span style={s.actionSub}>Download inventory list</span></button>
        <button style={s.actionBtn} onClick={() => navigate('/audit-logs')}>🕐 Audit Logs <br/><span style={s.actionSub}>View recent changes</span></button>
      </div>

      {canManage && (
        <button style={s.addBtn} onClick={() => setShowAdd(true)}>+ Add New Asset</button>
      )}
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
  assignBtn: { background:'#2563eb', color:'#fff', border:'none', padding:'10px 18px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' },
  summaryRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  summaryCard: { background:'#fff', borderRadius:12, padding:20, border:'1px solid #e2e8f0' },
  summaryLabel: { fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1, marginBottom:8 },
  summaryValue: { fontSize:32, fontWeight:800, lineHeight:1 },
  tableCard: { background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden', marginBottom:20 },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f8fafc' },
  td: { padding:'14px 16px', fontSize:14, color:'#374151' },
  assetName: { fontWeight:600, color:'#0f172a' },
  assetId: { fontSize:11, color:'#94a3b8', marginTop:2 },
  userBadge: { background:'#dbeafe', color:'#1d4ed8', padding:'4px 10px', borderRadius:20, fontSize:13 },
  menuBtn: { background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#64748b', padding:'2px 8px' },
  dropdown: { position:'absolute', right:0, top:'100%', background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,0.1)', zIndex:100, minWidth:160, overflow:'hidden' },
  dropItem: { display:'block', width:'100%', padding:'10px 16px', background:'none', border:'none', textAlign:'left', fontSize:13, cursor:'pointer', color:'#374151' },
  pagination: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderTop:'1px solid #f1f5f9' },
  pagingInfo: { fontSize:13, color:'#64748b' },
  pagingBtns: { display:'flex', gap:4 },
  pageBtn: { width:32, height:32, border:'none', borderRadius:6, cursor:'pointer', fontWeight:600, fontSize:13 },
  actionRow: { display:'flex', gap:16, marginBottom:20 },
  actionBtn: { background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px 24px', cursor:'pointer', fontSize:14, fontWeight:600, color:'#374151', textAlign:'left' },
  actionSub: { fontSize:12, color:'#94a3b8', fontWeight:400 },
  addBtn: { position:'fixed', bottom:32, left:280, background:'#2563eb', color:'#fff', border:'none', padding:'12px 20px', borderRadius:30, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 14px rgba(37,99,235,0.4)' },
};
