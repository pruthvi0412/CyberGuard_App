import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import { complaintsAPI } from '../services/api';
import { onStatusUpdate, offStatusUpdate } from '../services/socket';
import useAuthStore from '../hooks/useAuthStore';

const STATUS_COLORS = {
  pending:'#FFD600', under_review:'#00B4FF', investigating:'#FF6B35',
  resolved:'#00C896', closed:'#5A6480', rejected:'#FF5252'
};

export default function Dashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await complaintsAPI.getAll({ 
        status: statusFilter || undefined, 
        search: search || undefined,
        page: page,
        limit: 10
      });
      setComplaints(data.data.complaints);
      
      const s = data.data.stats || {};
      setStats({
        total: data.data.pagination.total || 0,
        pending: s.pending || 0,
        inProgress: (s.under_review || 0) + (s.investigating || 0) + (s.in_progress || 0),
        resolved: s.resolved || 0
      });
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load complaints'); }
    finally  { setLoading(false); }
  }, [statusFilter, search, page]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Real-time status updates
  useEffect(() => {
    const handler = ({ complaintId, status }) => {
      fetchComplaints();
      toast.success(`Complaint ${complaintId}: ${status.replace('_',' ')}`);
    };
    onStatusUpdate(handler);
    return () => offStatusUpdate(handler);
  }, [fetchComplaints]);

  const statCards = [
    { label: 'Total Filed',  value: stats.total,      color: '#00B4FF' },
    { label: 'Pending',      value: stats.pending,    color: '#FFD600' },
    { label: 'In Progress',  value: stats.inProgress, color: '#FF6B35' },
    { label: 'Resolved',     value: stats.resolved,   color: '#00C896' },
  ];

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
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 255, 209, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '80px 24px',
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
          }}>My <span style={{ color: '#007AFF' }}>Complaints</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 500 }}>Monitor and regulate your secure filings within the CyberGuard network.</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 48 }}>
          {statCards.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '32px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 8 }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <input 
            className="liquid-input"
            placeholder="Search complaints…"
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ 
              flex: 1, 
              minWidth: 260,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '16px 24px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none'
            }} 
          />
          <select 
            className="liquid-select"
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ 
              width: 200,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '0 16px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">ALL STATUSES</option>
            {['pending','under_review','investigating','resolved', 'closed','rejected'].map(s =>
              <option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>)}
          </select>
          <button 
            onClick={() => navigate('/chat')} 
            style={{ 
              whiteSpace: 'nowrap', 
              background: 'linear-gradient(135deg, #AF52DE 0%, #007AFF 100%)', 
              border: 'none',
              padding: '16px 28px',
              borderRadius: '20px',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(175, 82, 222, 0.3)'
            }}
          >
            NETWORK CHAT
          </button>
          <button 
            onClick={() => navigate('/submit')}
            style={{ 
              whiteSpace: 'nowrap',
              background: '#fff',
              border: 'none',
              padding: '16px 28px',
              borderRadius: '20px',
              color: '#000',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            + NEW FILING
          </button>
        </div>

        {/* Complaints list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 120, color: 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: 800, letterSpacing: '2px' }}>INITIALIZING DATA STREAM...</div>
        ) : complaints.length === 0 ? (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '32px',
            textAlign: 'center', 
            padding: 80 
          }}>
            <div style={{ fontSize: '64px', marginBottom: 24 }}>📭</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: '18px', fontWeight: 500 }}>No complaints detected in your clearance zone.</p>
            <button className="liquid-btn-primary" onClick={() => navigate('/submit')}>FILE INITIAL REPORT</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
              {complaints.map((c, i) => (
                <motion.div 
                  key={c._id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  style={{ 
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                  onClick={() => navigate(`/track/${c.complaintId}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#007AFF', letterSpacing: '1px' }}>
                          {c.complaintId}
                        </span>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 900,
                          background: `${STATUS_COLORS[c.status] || '#5A6480'}1A`,
                          color: STATUS_COLORS[c.status] || '#5A6480',
                          border: `1px solid ${STATUS_COLORS[c.status] || '#5A6480'}33`,
                          textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                          {c.status.replace('_',' ')}
                        </span>
                        {c.severity && (
                          <span style={{ 
                            padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 900,
                            background: c.severity === 'high' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                            color: c.severity === 'high' ? '#FF3B30' : '#FF9500',
                            border: `1px solid ${c.severity === 'high' ? '#FF3B3033' : '#FF950033'}`,
                            textTransform: 'uppercase', letterSpacing: '1px'
                          }}>
                            {c.severity}
                          </span>
                        )}
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {c.category?.replace('_',' ')}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>{c.title}</h3>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                        Filed on {format(new Date(c.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        width: 12, height: 12, borderRadius: '50%',
                        background: STATUS_COLORS[c.status] || '#5A6480',
                        boxShadow: `0 0 15px ${STATUS_COLORS[c.status] || '#5A6480'}`,
                        marginLeft: 'auto', marginBottom: 12
                      }} />
                      {c.mlPrediction?.confidence && (
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#00FFD1', letterSpacing: '1px' }}>
                          AI CONFIDENCE: {(c.mlPrediction.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 40, paddingBottom: 80 }}>
                <button 
                  disabled={page <= 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0,0); }}
                  style={{ 
                    padding: '12px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: '0.3s',
                    opacity: page <= 1 ? 0.3 : 1
                  }}
                >
                  PREVIOUS
                </button>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo(0,0); }}
                      style={{
                        width: 44, height: 44, borderRadius: '16px', border: '1px solid',
                        borderColor: p === page ? '#007AFF' : 'rgba(255,255,255,0.1)',
                        background: p === page ? 'rgba(0,122,255,0.1)' : 'transparent',
                        color: p === page ? '#007AFF' : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer', fontSize: '14px', fontWeight: 800, transition: '0.3s'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={page >= pagination.pages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
                  style={{ 
                    padding: '12px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: '0.3s',
                    opacity: page >= pagination.pages ? 0.3 : 1
                  }}
                >
                  NEXT
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
