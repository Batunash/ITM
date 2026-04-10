import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Layout from '../components/Layout';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = { Open:'#3b82f6', Pending:'#f59e0b', Resolved:'#10b981', Closed:'#6b7280', InProgress:'#8b5cf6', Assigned:'#06b6d4' };
const PRIORITY_COLORS = { Critical:'#ef4444', High:'#f97316', Medium:'#3b82f6', Low:'#22c55e' };
const STATUSES = [
  { id:1, name:'Open' }, { id:2, name:'Assigned' }, { id:3, name:'InProgress' },
  { id:4, name:'Pending' }, { id:5, name:'Resolved' }, { id:6, name:'Closed' },
];
const PRIORITIES = [
  { id:1, name:'Critical' }, { id:2, name:'High' }, { id:3, name:'Medium' }, { id:4, name:'Low' },
];

const Badge = ({ text, colorMap }) => {
  const color = colorMap[text] || '#94a3b8';
  return <span style={{ background:color+'20', color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{text}</span>;
};

const DL = ({ label, children }) => (
  <div>
    <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:0.8, textTransform:'uppercase', marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:14, color:'#0f172a' }}>{children}</div>
  </div>
);

export default function TicketManagementPage() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title:'', priorityId:'', description:'' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // attachments
  const [attachments, setAttachments] = useState([]);

  // detail panel actions
  const [assignAgentId, setAssignAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [newStatusId, setNewStatusId] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [closing, setClosing] = useState(false);
  const [actionError, setActionError] = useState('');

  const { user } = useAuth();
  const canAssign = ['ITManager','SystemAdmin'].includes(user?.role);
  const canClose  = ['ITSupportAgent','ITManager','SystemAdmin'].includes(user?.role);
  const canChangeStatus = ['ITSupportAgent','ITManager','SystemAdmin'].includes(user?.role);
  const isEndUser = user?.role === 'EndUser';

  const onDrop = useCallback(f => setFiles(p => [...p, ...f]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    const loadTickets = async () => {
      try {
        if (isEndUser) {
          const r = await api.get(`/tickets/user/${user.userId}`);
          setTickets(Array.isArray(r.data) ? r.data : []);
        } else if (user?.role === 'ITSupportAgent') {
          const r = await api.get('/tickets');
          const all = Array.isArray(r.data) ? r.data : [];
          setTickets(all.filter(t => t.assignedTo === user.fullName || t.createdBy === user.fullName));
        } else {
          const r = await api.get('/tickets');
          setTickets(Array.isArray(r.data) ? r.data : []);
        }
      } catch {}
    };
    loadTickets();

    if (canAssign) {
      api.get('/users').then(r => {
        const all = Array.isArray(r.data) ? r.data : [];
        setAgents(all.filter(u => u.role === 'ITSupportAgent'));
      }).catch(() => {});
    }
  }, []);

  const openDetail = (t) => {
    setSelected(t); setShowNew(false); setActionError(''); setAssignAgentId(''); setNewStatusId('');
    api.get(`/attachments/${t.id}`)
      .then(r => setAttachments(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAttachments([]));
  };

  const updateTicket = (updated) => {
    setTickets(p => p.map(t => t.id === updated.id ? updated : t));
    setSelected(updated);
  };

  /* ── Create ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/tickets', {
        userId: user?.userId, title: form.title,
        description: form.description, priorityId: parseInt(form.priorityId),
      });
      for (const file of files) {
        const fd = new FormData(); fd.append('file', file);
        await api.post(`/attachments/upload?ticketId=${data.id}`, fd).catch(() => {});
      }
      setTickets(p => [data, ...p]);
      setForm({ title:'', priorityId:'', description:'' }); setFiles([]); setShowNew(false);
    } catch { alert('Failed to create ticket.'); }
    finally { setSubmitting(false); }
  };

  /* ── Assign agent ── */
  const handleAssign = async () => {
    if (!assignAgentId) return;
    setAssigning(true); setActionError('');
    try {
      await api.post(`/tickets/${selected.id}/assign`, { agentId: parseInt(assignAgentId), managerId: user?.userId });
      const agent = agents.find(a => a.id === parseInt(assignAgentId));
      updateTicket({ ...selected, assignedTo: agent?.fullName ?? 'Agent', status:'Assigned' });
      setAssignAgentId('');
    } catch { setActionError('Failed to assign agent.'); }
    finally { setAssigning(false); }
  };

  /* ── Update status ── */
  const handleStatus = async () => {
    if (!newStatusId) return;
    setUpdatingStatus(true); setActionError('');
    try {
      await api.put(`/tickets/${selected.id}/status?statusId=${newStatusId}`);
      const name = STATUSES.find(s => s.id === parseInt(newStatusId))?.name ?? selected.status;
      updateTicket({ ...selected, status: name });
      setNewStatusId('');
    } catch { setActionError('Failed to update status.'); }
    finally { setUpdatingStatus(false); }
  };

  /* ── Close ── */
  const handleClose = async () => {
    setClosing(true); setActionError('');
    try {
      await api.post(`/tickets/${selected.id}/close`, { closedById: user?.userId });
      updateTicket({ ...selected, status:'Closed' });
    } catch { setActionError('Failed to close ticket.'); }
    finally { setClosing(false); }
  };

  return (
    <Layout>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Active Tickets</h1>
          <p style={s.subtitle}>Manage and resolve incoming service requests</p>
        </div>
        <button style={s.newBtn} onClick={() => { setShowNew(p => !p); setSelected(null); }}>
          + Create New Ticket
        </button>
      </div>

      <div style={s.content}>
        {/* Table */}
        <div style={{ flex:1, minWidth:0 }}>
          <table style={s.table}>
            <thead>
              <tr>{['TICKET ID','TITLE','STATUS','PRIORITY','ASSIGNED AGENT','ACTION'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} style={{ ...s.tr, background: selected?.id===t.id ? '#eff6ff' : undefined }}>
                  <td style={s.td}><span style={s.ticketId}>INC-{t.id}</span></td>
                  <td style={s.td}>{t.title}</td>
                  <td style={s.td}><Badge text={t.status} colorMap={STATUS_COLORS} /></td>
                  <td style={s.td}><Badge text={t.priority} colorMap={PRIORITY_COLORS} /></td>
                  <td style={s.td}>{t.assignedTo || <span style={{color:'#94a3b8'}}>Unassigned</span>}</td>
                  <td style={s.td}><button style={s.viewBtn} onClick={() => openDetail(t)}>View</button></td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan={6} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:32}}>No tickets found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* New Ticket Panel */}
        {showNew && (
          <div style={s.panel}>
            <div style={s.panelHead}>
              <span style={s.panelTitle}>New Ticket</span>
              <button style={s.closeBtn} onClick={() => setShowNew(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} style={s.form}>
              <label style={s.lbl}>TICKET TITLE</label>
              <input style={s.inp} placeholder="e.g., Cannot access Outlook" value={form.title}
                onChange={e => setForm({...form, title:e.target.value})} required />

              <label style={{...s.lbl, marginTop:14}}>PRIORITY</label>
              <select style={s.inp} value={form.priorityId}
                onChange={e => setForm({...form, priorityId:e.target.value})} required>
                <option value="">Select priority...</option>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <label style={{...s.lbl, marginTop:14}}>DESCRIPTION</label>
              <textarea style={{...s.inp, height:80, resize:'vertical'}}
                placeholder="Detailed explanation..." value={form.description}
                onChange={e => setForm({...form, description:e.target.value})} required />

              <label style={{...s.lbl, marginTop:14}}>ATTACHMENTS</label>
              <div {...getRootProps()} style={{...s.dropzone, border: isDragActive ? '2px dashed #2563eb' : '2px dashed #e2e8f0'}}>
                <input {...getInputProps()} />
                <div style={{textAlign:'center', color:'#94a3b8'}}>
                  <div style={{fontSize:24, marginBottom:6}}>📄</div>
                  <div style={{fontSize:13}}>Drop files here</div>
                  <div style={{fontSize:11}}>or click to browse</div>
                </div>
              </div>
              {files.length > 0 && files.map((f,i) => (
                <div key={i} style={{fontSize:12, color:'#64748b', marginTop:4}}>📎 {f.name}</div>
              ))}
              <button type="submit" style={s.submitBtn} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <div style={s.submitNote}>A TICKET ID WILL BE GENERATED UPON SUBMISSION</div>
            </form>
          </div>
        )}

        {/* Detail Panel */}
        {selected && !showNew && (
          <div style={s.panel}>
            <div style={s.panelHead}>
              <span style={s.panelTitle}>INC-{selected.id}</span>
              <button style={s.closeBtn} onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{padding:20, display:'flex', flexDirection:'column', gap:14, overflowY:'auto', maxHeight:'calc(100vh - 180px)'}}>
              <DL label="Title">{selected.title}</DL>
              <div style={{display:'flex', gap:12}}>
                <DL label="Status"><Badge text={selected.status} colorMap={STATUS_COLORS} /></DL>
                <DL label="Priority"><Badge text={selected.priority} colorMap={PRIORITY_COLORS} /></DL>
              </div>
              {selected.description && <DL label="Description"><span style={{color:'#64748b', lineHeight:1.6}}>{selected.description}</span></DL>}
              <div style={{display:'flex', gap:12}}>
                <DL label="Created By">{selected.createdBy}</DL>
                <DL label="Assigned To">{selected.assignedTo || <span style={{color:'#94a3b8'}}>Unassigned</span>}</DL>
              </div>
              <DL label="Created">{new Date(selected.createdAt).toLocaleString()}</DL>

              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:0.8, textTransform:'uppercase', marginBottom:6 }}>ATTACHMENTS</div>
                {attachments.length === 0 ? (
                  <div style={{ fontSize:13, color:'#94a3b8' }}>No attachments</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {attachments.map(att => {
                      const fileName = att.filePath ? att.filePath.replace(/\\/g, '/').split('/').pop() : '';
                      const idx = fileName.indexOf('_');
                      const displayName = idx >= 0 ? fileName.slice(idx + 1) : fileName;
                      return (
                        <a key={att.id}
                          href={`http://localhost:5201/api/attachments/download/${att.id}`}
                          target="_blank" rel="noreferrer"
                          style={{ fontSize:13, color:'#2563eb', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                          📎 {displayName}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {actionError && <div style={{background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'8px 12px', borderRadius:8, fontSize:13}}>{actionError}</div>}

              {selected.status !== 'Closed' && !isEndUser && (
                <div style={{borderTop:'1px solid #f1f5f9', paddingTop:14, display:'flex', flexDirection:'column', gap:10}}>
                  <div style={{fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:0.8, textTransform:'uppercase'}}>ACTIONS</div>

                  {/* Change status */}
                  {canChangeStatus && (
                    <div style={{display:'flex', gap:8}}>
                      <select style={{...s.inp, flex:1}} value={newStatusId} onChange={e => setNewStatusId(e.target.value)}>
                        <option value="">Change status...</option>
                        {STATUSES.filter(x => x.name !== selected.status).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                      <button style={{...s.actBtn, opacity:(!newStatusId||updatingStatus)?0.5:1}}
                        disabled={!newStatusId || updatingStatus} onClick={handleStatus}>
                        {updatingStatus ? '...' : 'Set'}
                      </button>
                    </div>
                  )}

                  {/* Assign agent */}
                  {canAssign && (
                    <div style={{display:'flex', gap:8}}>
                      <select style={{...s.inp, flex:1}} value={assignAgentId} onChange={e => setAssignAgentId(e.target.value)}>
                        <option value="">Assign agent...</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                      </select>
                      <button style={{...s.actBtn, opacity:(!assignAgentId||assigning)?0.5:1}}
                        disabled={!assignAgentId || assigning} onClick={handleAssign}>
                        {assigning ? '...' : 'Assign'}
                      </button>
                    </div>
                  )}

                  {/* Close */}
                  {canClose && (
                    <button style={{...s.closeTicketBtn, opacity:closing?0.5:1}} disabled={closing} onClick={handleClose}>
                      {closing ? 'Closing...' : '✓ Close Ticket'}
                    </button>
                  )}
                </div>
              )}
              {selected.status === 'Closed' && (
                <div style={{textAlign:'center', color:'#22c55e', fontSize:13, fontWeight:600, padding:'8px 0', borderTop:'1px solid #f1f5f9', marginTop:4}}>
                  ✓ Ticket is closed
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

const s = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  pageTitle: { margin:0, fontSize:22, fontWeight:700, color:'#0f172a' },
  subtitle: { margin:'4px 0 0', color:'#64748b', fontSize:14 },
  newBtn: { background:'#2563eb', color:'#fff', border:'none', padding:'10px 18px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', flexShrink:0 },
  content: { display:'flex', gap:20, alignItems:'flex-start' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0' },
  th: { textAlign:'left', padding:'12px 14px', fontSize:11, fontWeight:700, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  tr: { borderBottom:'1px solid #f8fafc' },
  td: { padding:'12px 14px', fontSize:14, color:'#374151' },
  ticketId: { fontWeight:700, color:'#64748b', fontSize:13 },
  viewBtn: { background:'transparent', border:'1px solid #e2e8f0', borderRadius:6, padding:'5px 14px', fontSize:13, color:'#374151', cursor:'pointer' },
  panel: { width:320, background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', flexShrink:0 },
  panelHead: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #f1f5f9' },
  panelTitle: { fontWeight:700, fontSize:15, color:'#0f172a' },
  closeBtn: { background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#64748b' },
  form: { padding:20, display:'flex', flexDirection:'column' },
  lbl: { fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:0.5, marginBottom:6 },
  inp: { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' },
  dropzone: { borderRadius:8, padding:'24px 16px', cursor:'pointer', background:'#f8fafc', marginTop:4 },
  submitBtn: { marginTop:18, background:'#2563eb', color:'#fff', border:'none', padding:'12px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', width:'100%' },
  submitNote: { textAlign:'center', fontSize:10, color:'#94a3b8', marginTop:8 },
  actBtn: { padding:'9px 14px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', flexShrink:0 },
  closeTicketBtn: { width:'100%', padding:'10px', background:'#dcfce7', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' },
};
