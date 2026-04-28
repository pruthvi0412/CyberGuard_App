import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Navbar from '../components/Navbar';
import { analyticsAPI, adminAPI } from '../services/api';
import { onNewComplaint, offNewComplaint } from '../services/socket';
import toast from 'react-hot-toast';

const COLORS = ['#00B4FF','#00FFD1','#FF6B35','#FFD600','#9C27B0','#00C896','#F44336','#2196F3','#FF9800','#E91E63','#5A6480'];

function StatCard({ label, value, sub, color, icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card-cyber" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 12, color: '#5A6480', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: color || '#fff', fontFamily: 'Orbitron,monospace' }}>{value}</p>
          {sub && <p style={{ fontSize: 11, color: '#5A6480', marginTop: 4 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview]   = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends]       = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [mlStatus, setMlStatus]   = useState(null);
  const [loading, setLoading]     = useState(true);

  const fetchAll = async () => {
    try {
      const [ov, cat, tr, sd, ml] = await Promise.all([
        analyticsAPI.overview(),
        analyticsAPI.byCategory(),
        analyticsAPI.trends(6),
        analyticsAPI.statusDist(),
        adminAPI.mlStatus(),
      ]);
      setOverview(ov.data.data.overview);
      setCategories(cat.data.data.categories.map(c => ({ name: c._id?.replace(/_/g,' ') || 'other', count: c.count })));
      setTrends(tr.data.data.trends);
      setStatusDist(sd.data.data.distribution.map(d => ({ name: d._id?.replace(/_/g,' '), value: d.count })));
      setMlStatus(ml.data.data);
    } catch (e) {
      toast.error('Failed to load analytics');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    const handler = (c) => {
      toast(`🆕 New complaint: ${c.title?.slice(0, 40)}`, { icon: '📋' });
      fetchAll();
    };
    onNewComplaint(handler);
    return () => offNewComplaint(handler);
  }, []);

  const tooltipStyle = { background: '#0C1428', border: '1px solid rgba(0,180,255,0.3)', color: '#E0E8FF', fontSize: 12 };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
        <div style={{ color: '#00B4FF', fontFamily: 'Orbitron,monospace', fontSize: 14 }}>Loading analytics…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, color: '#fff', marginBottom: 4 }}>Admin Dashboard</h1>
            <p style={{ color: '#5A6480', fontSize: 13 }}>Real-time cybercrime analytics & management</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline" style={{ fontSize: 12, padding: '8px 16px' }}
              onClick={() => navigate('/admin/complaints')}>Manage Complaints</button>
            <button className="btn-outline" style={{ fontSize: 12, padding: '8px 16px' }}
              onClick={() => navigate('/admin/users')}>Manage Users</button>
            <button className="btn-outline" style={{ fontSize: 12, padding: '8px 16px' }}
              onClick={() => navigate('/admin/analytics')}>Deep Analytics</button>
          </div>
        </div>

        {/* ML Status badge */}
        {mlStatus && (
          <div style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 8,
            background: mlStatus.mlService?.status === 'online' ? 'rgba(0,200,150,0.08)' : 'rgba(255,107,53,0.08)',
            border: `1px solid ${mlStatus.mlService?.status === 'online' ? 'rgba(0,200,150,0.3)' : 'rgba(255,107,53,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%',
              background: mlStatus.mlService?.status === 'online' ? '#00C896' : '#FF6B35',
              boxShadow: `0 0 8px ${mlStatus.mlService?.status === 'online' ? '#00C896' : '#FF6B35'}` }} />
            <span style={{ fontSize: 12, color: mlStatus.mlService?.status === 'online' ? '#00C896' : '#FF6B35' }}>
              ML Service: {mlStatus.mlService?.status?.toUpperCase()}
            </span>
            {mlStatus.modelInfo && (
              <span style={{ fontSize: 11, color: '#5A6480', marginLeft: 8 }}>
                • Algorithm: {mlStatus.modelInfo.algorithm} • Categories: {mlStatus.modelInfo.categories?.length}
              </span>
            )}
          </div>
        )}

        {/* Stat cards */}
        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Complaints"  value={overview.totalComplaints}   color="#00B4FF" icon="📋" />
            <StatCard label="Pending"           value={overview.pendingComplaints}  color="#FFD600" icon="⏳"
              sub="Awaiting assignment" />
            <StatCard label="Resolved"          value={overview.resolvedComplaints} color="#00C896" icon="✅"
              sub={`${overview.resolutionRate}% rate`} />
            <StatCard label="Critical Cases"    value={overview.criticalComplaints} color="#FF6B35" icon="🚨" />
            <StatCard label="This Month"        value={overview.thisMonthComplaints}color="#00FFD1" icon="📅"
              sub={`${overview.growthRate > 0 ? '+' : ''}${overview.growthRate}% vs last month`} />
            <StatCard label="Avg Resolution"    value={`${overview.avgResolutionDays}d`} color="#9C27B0" icon="⏱️" />
          </div>
        )}

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Trends line chart */}
          <div className="card-cyber">
            <h3 style={{ fontSize: 13, color: '#00B4FF', marginBottom: 16, fontFamily: 'Orbitron,monospace' }}>
              MONTHLY TRENDS
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#5A6480', fontSize: 10 }} />
                <YAxis tick={{ fill: '#5A6480', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="total"    stroke="#00B4FF" strokeWidth={2} dot={{ r: 3 }} name="Total" />
                <Line type="monotone" dataKey="resolved" stroke="#00C896" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
                <Line type="monotone" dataKey="pending"  stroke="#FFD600" strokeWidth={2} dot={{ r: 3 }} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div className="card-cyber">
            <h3 style={{ fontSize: 13, color: '#00B4FF', marginBottom: 16, fontFamily: 'Orbitron,monospace' }}>
              STATUS DISTRIBUTION
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(0,180,255,0.3)' }}>
                  {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category bar chart */}
        <div className="card-cyber">
          <h3 style={{ fontSize: 13, color: '#00B4FF', marginBottom: 16, fontFamily: 'Orbitron,monospace' }}>
            COMPLAINTS BY CATEGORY
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categories} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#5A6480', fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#5A6480', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Complaints" radius={[4,4,0,0]}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
