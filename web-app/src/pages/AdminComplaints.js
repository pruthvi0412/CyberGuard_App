import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { complaintsAPI } from '../services/api';

const STATUSES = ['pending','under_review','investigating','resolved','closed','rejected'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [filters,    setFilters]    = useState({ status:'', category:'', page: 1 });
  const [total,      setTotal]      = useState(0);
  const [statusForm, setStatusForm] = useState({ status:'', message:'' });
  const [updating,   setUpdating]   = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { limit: 15, ...filters };
      const { data } = await complaintsAPI.getAll(params);
      setComplaints(data.data.complaints);
      setTotal(data.data.pagination.total);
    } catch { toast.error('Failed to load complaints'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, [filters]);

  const handleStatusUpdate = async () => {
    if (!statusForm.status) return toast.error('Select a status');
    setUpdating(true);
    try {
      await complaintsAPI.updateStatus(selected._id, statusForm);
      toast.success('Status updated successfully');
      setSelected(null);
      setStatusForm({ status:'', message:'' });
      fetchComplaints();
    } catch { toast.error('Update failed'); }
    finally  { setUpdating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    try {
      await complaintsAPI.delete(id);
      toast.success('Complaint deleted');
      fetchComplaints();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, color: '#fff', marginBottom: 4 }}>
            Complaint Management
          </h1>
          <p style={{ color: '#5A6480', fontSize: 13 }}>{total} total complaints in system</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <select className="input-cyber" value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
            style={{ width: 160 }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
          <select className="input-cyber" value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
            style={{ width: 180 }}>
            <option value="">All Categories</option>
            {['phishing','identity_theft','online_fraud','cyberbullying','hacking','ransomware',
              'social_media_crime','financial_fraud','data_breach','child_exploitation','other'
            ].map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card-cyber" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(13,71,161,0.3)', borderBottom: '1px solid rgba(0,180,255,0.2)' }}>
                  {['Complaint ID','Title','Category','Severity','Status','Date','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11,
                      color: '#00B4FF', fontFamily: 'Orbitron,monospace', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#5A6480' }}>Loading…</td></tr>
                ) : complaints.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#5A6480' }}>No complaints found</td></tr>
                ) : complaints.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(0,180,255,0.06)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(0,180,255,0.02)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 11, fontFamily: 'Orbitron,monospace', color: '#00B4FF' }}>
                      {c.complaintId}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#E0E8FF', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#5A6480', marginTop: 2 }}>
                        {c.userId?.name || 'Anonymous'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#00FFD1', textTransform: 'uppercase' }}>
                      {c.category?.replace(/_/g,' ')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge sev-${c.severity}`}
                        style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12,
                          background: 'rgba(255,255,255,0.05)' }}>
                        {c.severity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-${c.status}`}>{c.status.replace(/_/g,' ')}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#5A6480', whiteSpace: 'nowrap' }}>
                      {format(new Date(c.createdAt), 'dd MMM yy')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setSelected(c); setStatusForm({ status: c.status, message: '' }); }}
                          style={{ background: 'rgba(0,180,255,0.1)', border: '1px solid rgba(0,180,255,0.3)',
                            color: '#00B4FF', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                          Update
                        </button>
                        <button onClick={() => handleDelete(c._id)}
                          style={{ background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)',
                            color: '#FF5252', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,180,255,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#5A6480' }}>
              Page {filters.page} of {Math.ceil(total / 15) || 1}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-outline" style={{ padding: '5px 14px', fontSize: 12 }}
                disabled={filters.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
              <button className="btn-outline" style={{ padding: '5px 14px', fontSize: 12 }}
                disabled={filters.page >= Math.ceil(total / 15)}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
            </div>
          </div>
        </div>

        {/* Status update modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="card-cyber" style={{ width: '100%', maxWidth: 480 }}>
              <h3 style={{ fontSize: 15, color: '#00B4FF', marginBottom: 6, fontFamily: 'Orbitron,monospace' }}>
                UPDATE STATUS
              </h3>
              <p style={{ fontSize: 12, color: '#5A6480', marginBottom: 20 }}>{selected.complaintId} — {selected.title?.slice(0,60)}</p>

              <div style={{ marginBottom: 16 }}>
                <label>New Status</label>
                <select className="input-cyber" value={statusForm.status}
                  onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="">Select status…</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label>Message to complainant (optional)</label>
                <textarea className="input-cyber" rows={3}
                  placeholder="e.g. Your complaint has been assigned to Cyber Cell Mumbai…"
                  value={statusForm.message}
                  onChange={e => setStatusForm(f => ({ ...f, message: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'Inter,sans-serif' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1 }}
                  onClick={handleStatusUpdate} disabled={updating}>
                  {updating ? 'Updating…' : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
