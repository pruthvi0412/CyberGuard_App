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

  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await complaintsAPI.getAll({ status: statusFilter || undefined, search: search || undefined });
      setComplaints(data.data.complaints);
    } catch { toast.error('Failed to load complaints'); }
    finally  { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Real-time status updates
  useEffect(() => {
    const handler = ({ complaintId, status, message }) => {
      setComplaints(prev => prev.map(c =>
        c.complaintId === complaintId ? { ...c, status } : c
      ));
      toast.success(`Complaint ${complaintId}: ${status.replace('_',' ')}`);
    };
    onStatusUpdate(handler);
    return () => offStatusUpdate(handler);
  }, []);

  const stats = [
    { label: 'Total Filed',  value: complaints.length, color: '#00B4FF' },
    { label: 'Pending',      value: complaints.filter(c => c.status === 'pending').length,   color: '#FFD600' },
    { label: 'In Progress',  value: complaints.filter(c => ['under_review','investigating'].includes(c.status)).length, color: '#FF6B35' },
    { label: 'Resolved',     value: complaints.filter(c => c.status === 'resolved').length,  color: '#00C896' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, color: '#fff', marginBottom: 4 }}>
            My Complaints
          </h1>
          <p style={{ color: '#5A6480', fontSize: 13 }}>Track all your filed cybercrimes in one place</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} className="card-cyber" style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'Orbitron,monospace' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: '#5A6480', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="input-cyber" placeholder="Search complaints…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }} />
          <select className="input-cyber" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 180 }}>
            <option value="">All Statuses</option>
            {['pending','under_review','investigating','resolved','closed','rejected'].map(s =>
              <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <button className="btn-primary" onClick={() => navigate('/submit')} style={{ whiteSpace: 'nowrap' }}>
            + New Complaint
          </button>
        </div>

        {/* Complaints list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#5A6480' }}>Loading…</div>
        ) : complaints.length === 0 ? (
          <div className="card-cyber" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ color: '#5A6480', marginBottom: 20 }}>No complaints filed yet.</p>
            <button className="btn-primary" onClick={() => navigate('/submit')}>File First Complaint</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {complaints.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="card-cyber" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/track/${c.complaintId}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: '#00B4FF' }}>
                        {c.complaintId}
                      </span>
                      <span className={`badge badge-${c.status}`}>{c.status.replace('_',' ')}</span>
                      <span style={{ fontSize: 11, color: '#5A6480', textTransform: 'uppercase' }}>
                        {c.category?.replace('_',' ')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E0E8FF', marginBottom: 6 }}>{c.title}</h3>
                    <p style={{ fontSize: 12, color: '#5A6480' }}>
                      Filed {format(new Date(c.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%',
                      background: STATUS_COLORS[c.status] || '#5A6480',
                      boxShadow: `0 0 8px ${STATUS_COLORS[c.status] || '#5A6480'}` }} />
                    {c.mlPrediction?.confidence && (
                      <span style={{ fontSize: 11, color: '#00FFD1' }}>
                        AI: {(c.mlPrediction.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
