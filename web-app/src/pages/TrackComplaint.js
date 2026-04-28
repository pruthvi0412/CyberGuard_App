import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { complaintsAPI } from '../services/api';

const STATUS_COLOR = {
  pending:'#FFD600', under_review:'#00B4FF', investigating:'#FF6B35',
  resolved:'#00C896', closed:'#5A6480', rejected:'#FF5252'
};

export default function TrackComplaint() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [id,          setId]        = useState(complaintId || '');
  const [complaint,   setComplaint] = useState(null);
  const [loading,     setLoading]   = useState(false);
  const [error,       setError]     = useState('');

  const track = async (searchId) => {
    const q = (searchId || id).trim();
    if (!q) return;
    setLoading(true); setError(''); setComplaint(null);
    try {
      const { data } = await complaintsAPI.track(q);
      setComplaint(data.data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint not found. Please check the ID.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (complaintId) track(complaintId); }, [complaintId]);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', padding: 24 }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage:
        'linear-gradient(rgba(0,180,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,0.02) 1px,transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 680, margin: '40px auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#00B4FF', cursor: 'pointer', fontSize: 20 }}>←</button>
          <div>
            <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, color: '#fff' }}>Track Complaint</h1>
            <p style={{ color: '#5A6480', fontSize: 12 }}>No login required</p>
          </div>
        </div>

        {/* Search box */}
        <div className="card-cyber" style={{ marginBottom: 24 }}>
          <label>Enter Complaint ID</label>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <input className="input-cyber" placeholder="CC-202504-000001"
              value={id} onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && track()}
              style={{ flex: 1, fontFamily: 'Orbitron,monospace', letterSpacing: 1 }} />
            <button className="btn-primary" onClick={() => track()} disabled={loading}
              style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}>
              {loading ? '…' : 'Track'}
            </button>
          </div>
          {error && <p style={{ color: '#FF6B35', marginTop: 10, fontSize: 13 }}>⚠️ {error}</p>}
        </div>

        {/* Result */}
        {complaint && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-cyber" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: '#00B4FF' }}>
                    {complaint.complaintId}
                  </span>
                  <h2 style={{ fontSize: 17, color: '#fff', margin: '8px 0' }}>{complaint.title}</h2>
                  <p style={{ fontSize: 12, color: '#5A6480' }}>
                    Filed: {format(new Date(complaint.createdAt), 'dd MMM yyyy')} •{' '}
                    Category: <span style={{ color: '#00B4FF' }}>{complaint.category?.replace(/_/g,' ')}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className={`badge badge-${complaint.status}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                    {complaint.status.replace(/_/g,' ').toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: '#5A6480' }}>
                    Severity: <span className={`sev-${complaint.severity}`}>{complaint.severity}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card-cyber">
              <h3 style={{ fontSize: 14, color: '#00B4FF', marginBottom: 20, fontFamily: 'Orbitron,monospace' }}>
                CASE TIMELINE
              </h3>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0,
                  width: 2, background: 'linear-gradient(to bottom, #00B4FF, rgba(0,180,255,0.1))' }} />
                {(complaint.timeline || []).map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ display: 'flex', gap: 20, marginBottom: 24, position: 'relative' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                      background: i === (complaint.timeline.length - 1) ? STATUS_COLOR[t.status] || '#00B4FF' : 'rgba(0,180,255,0.2)',
                      border: `2px solid ${STATUS_COLOR[t.status] || '#00B4FF'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: i === (complaint.timeline.length - 1) ? `0 0 12px ${STATUS_COLOR[t.status] || '#00B4FF'}` : 'none',
                    }}>
                      <span style={{ fontSize: 12 }}>
                        {t.status === 'resolved' ? '✓' : t.status === 'pending' ? '⏳' : '●'}
                      </span>
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E0E8FF', marginBottom: 2 }}>
                        {t.message}
                      </div>
                      <div style={{ fontSize: 11, color: '#5A6480' }}>
                        {format(new Date(t.timestamp), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
