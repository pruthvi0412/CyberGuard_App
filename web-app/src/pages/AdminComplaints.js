import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { complaintsAPI } from '../services/api';

const STATUSES = ['pending','under_review','investigating','resolved','closed','rejected'];

export default function AdminComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [filters,    setFilters]    = useState({ status:'', category:'', severity: '', page: 1 });
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
    <div style={{ 
      minHeight: '100vh', 
      background: '#02060A', 
      color: '#fff',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Liquid Atmospheric Accents */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(160, 32, 240, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <div style={{ 
        maxWidth: 1300, 
        margin: '0 auto', 
        padding: '80px 40px',
        position: 'relative',
        zIndex: 1
      }}>

        <div style={{ marginBottom: 48 }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 800, 
            background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-2.5px',
            margin: '0 0 12px 0'
          }}>Forensic <span style={{ color: '#007AFF' }}>Backlog</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 500 }}>Global repository oversight: {total} active incidents detected.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <select 
            className="liquid-select" 
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
            style={{ 
              width: 200, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '16px 20px',
              color: '#fff', fontSize: '14px', fontWeight: 700, outline: 'none'
            }}
          >
            <option value="">ALL STATUSES</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ').toUpperCase()}</option>)}
          </select>
          <select 
            className="liquid-select" 
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
            style={{ 
              width: 220, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '16px 20px',
              color: '#fff', fontSize: '14px', fontWeight: 700, outline: 'none'
            }}
          >
            <option value="">ALL CATEGORIES</option>
            {['phishing','identity_theft','online_fraud','cyberbullying','hacking','ransomware',
              'social_media_crime','financial_fraud','data_breach','child_exploitation','other'
            ].map(c => <option key={c} value={c}>{c.replace(/_/g,' ').toUpperCase()}</option>)}
          </select>
          <select 
            className="liquid-select" 
            value={filters.severity}
            onChange={e => setFilters(f => ({ ...f, severity: e.target.value, page: 1 }))}
            style={{ 
              width: 180, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '16px 20px',
              color: '#fff', fontSize: '14px', fontWeight: 700, outline: 'none'
            }}
          >
            <option value="">ALL SEVERITY</option>
            <option value="low">LOW</option>
            <option value="medium">MEDIUM</option>
            <option value="high">HIGH</option>
          </select>
        </div>

        {/* Table Container */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['INCIDENT ID','OBJECTIVE','CATEGORY','THREAT LEVEL','STATUS','LOCATION','TIMELAPSE','OPERATIONS'].map(h => (
                    <th key={h} style={{ 
                      padding: '24px 24px', textAlign: 'left', fontSize: '10px',
                      color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '1px'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 120, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: 800, letterSpacing: '2px' }}>SYNCHRONIZING REPOSITORY...</td></tr>
                ) : complaints.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 80, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>No active incidents match current clearance parameters.</td></tr>
                ) : complaints.map((c, i) => (
                  <motion.tr 
                    key={c._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td style={{ 
                      padding: '20px 24px', fontSize: '11px', fontWeight: 900, 
                      color: c.severity === 'high' ? '#FF3B30' : '#007AFF',
                      letterSpacing: '0.5px'
                    }}>
                      {c.complaintId}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 4 }}>
                        SOURCE: {c.userId?.name || 'ANONYMOUS'}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '11px', color: '#00FFD1', fontWeight: 800, textTransform: 'uppercase' }}>
                      {c.category?.replace(/_/g,' ')}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 900,
                        background: c.severity === 'high' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                        color: c.severity === 'high' ? '#FF3B30' : '#FF9500',
                        border: `1px solid ${c.severity === 'high' ? '#FF3B3033' : '#FF950033'}`,
                        textTransform: 'uppercase', letterSpacing: '1px'
                      }}>
                        {c.severity}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 900,
                        background: 'rgba(0, 122, 255, 0.1)',
                        color: '#007AFF',
                        border: '1px solid rgba(0, 122, 255, 0.2)',
                        textTransform: 'uppercase', letterSpacing: '1px'
                      }}>
                        {c.status.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '11px', color: '#fff', fontWeight: 700 }}>
                      {c.victimDetails?.pincode || 'N/A'}
                      {c.location?.coordinates?.length === 2 && (
                        <span style={{ 
                          width: 8, height: 8, borderRadius: '50%', background: '#34C759', 
                          display: 'inline-block', marginLeft: 8, boxShadow: '0 0 10px #34C759' 
                        }} />
                      )}
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                      {format(new Date(c.createdAt), 'dd MMM yy')}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => navigate(`/complaint/${c.complaintId}`)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', borderRadius: '10px', padding: '8px 14px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                          VIEW
                        </button>
                        <button onClick={() => { setSelected(c); setStatusForm({ status: c.status, message: '' }); }}
                          style={{ background: 'rgba(0,122,255,0.1)', border: '1px solid rgba(0,122,255,0.2)',
                            color: '#007AFF', borderRadius: '10px', padding: '8px 14px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                          UPDATE
                        </button>
                        <button onClick={() => handleDelete(c._id)}
                          style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)',
                            color: '#FF3B30', borderRadius: '10px', padding: '8px 14px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>
                          PURGE
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ 
            padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.01)'
          }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
              TERMINAL {filters.page} / {Math.ceil(total / 15) || 1}
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                disabled={filters.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                style={{ 
                  padding: '10px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '11px', cursor: 'pointer', opacity: filters.page <= 1 ? 0.3 : 1
                }}
              >PREV</button>
              <button 
                disabled={filters.page >= Math.ceil(total / 15)}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                style={{ 
                  padding: '10px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '11px', cursor: 'pointer', opacity: filters.page >= Math.ceil(total / 15) ? 0.3 : 1
                }}
              >NEXT</button>
            </div>
          </div>
        </div>

        {/* Status update modal */}
        <AnimatePresence>
          {selected && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(10px)' }}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                style={{ 
                  width: '100%', maxWidth: 520, background: 'rgba(20, 25, 35, 0.95)',
                  backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '32px', padding: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
                }}
              >
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-1px' }}>Update Protocol</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontWeight: 500 }}>{selected.complaintId} — {selected.title}</p>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, display: 'block' }}>Target Status</label>
                  <select 
                    className="liquid-select" 
                    value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                    style={{ 
                      width: '100%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '15px', fontWeight: 700, outline: 'none'
                    }}
                  >
                    <option value="">SELECT STATUS PROTOCOL...</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 40 }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, display: 'block' }}>Neutralization Summary (Optional)</label>
                  <textarea 
                    className="liquid-input" 
                    rows={4}
                    placeholder="Enter forensic update for the source..."
                    value={statusForm.message}
                    onChange={e => setStatusForm(f => ({ ...f, message: e.target.value }))}
                    style={{ 
                      width: '100%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '15px', outline: 'none', resize: 'none'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button 
                    style={{ 
                      flex: 1, padding: '18px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, cursor: 'pointer'
                    }} 
                    onClick={() => setSelected(null)}
                  >ABORT</button>
                  <button 
                    style={{ 
                      flex: 1, padding: '18px', borderRadius: '16px', background: '#007AFF',
                      border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 10px 20px rgba(0, 122, 255, 0.3)'
                    }}
                    onClick={handleStatusUpdate} 
                    disabled={updating}
                  >
                    {updating ? 'EXECUTING...' : 'COMMIT CHANGES'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
