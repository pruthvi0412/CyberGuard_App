import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { analyticsAPI } from '../services/api';

const COLORS = ['#00B4FF','#00FFD1','#FF6B35','#FFD600','#9C27B0','#00C896','#F44336','#2196F3','#FF9800','#E91E63','#5A6480'];
const TT = { background:'#0C1428', border:'1px solid rgba(0,180,255,0.3)', color:'#E0E8FF', fontSize: 12 };

export default function AdminAnalytics() {
  const [trends,    setTrends]    = useState([]);
  const [cats,      setCats]      = useState([]);
  const [geo,       setGeo]       = useState([]);
  const [financial, setFinancial] = useState({ data: [], total: 0 });
  const [months,    setMonths]    = useState(12);
  const [loading,   setLoading]   = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tr, ca, ge, fi] = await Promise.all([
        analyticsAPI.trends(months),
        analyticsAPI.byCategory(),
        analyticsAPI.geographic(),
        analyticsAPI.financial(),
      ]);
      setTrends(tr.data.data.trends);
      setCats(ca.data.data.categories.map(c => ({ name: c._id?.replace(/_/g,' ') || 'other', count: c.count, resolved: c.resolved })));
      setGeo(ge.data.data.geographic.map(g => ({ state: g._id, count: g.count })));
      setFinancial({ data: fi.data.data.financialAnalysis, total: fi.data.data.totalFinancialLoss });
    } catch { toast.error('Failed to load analytics'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [months]);

  const Section = ({ title, children }) => (
    <div className="card-cyber" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 13, color: '#00B4FF', marginBottom: 20, fontFamily: 'Orbitron,monospace', letterSpacing: 1 }}>
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, color: '#fff', marginBottom: 4 }}>Deep Analytics</h1>
            <p style={{ color: '#5A6480', fontSize: 13 }}>Comprehensive data insights for law enforcement</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#5A6480' }}>Trend Period:</span>
            {[3,6,12].map(m => (
              <button key={m} onClick={() => setMonths(m)}
                style={{ padding: '6px 14px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                  background: months === m ? 'linear-gradient(135deg,#0D47A1,#00B4FF)' : 'rgba(0,180,255,0.05)',
                  border: `1px solid ${months === m ? '#00B4FF' : 'rgba(0,180,255,0.2)'}`,
                  color: months === m ? '#fff' : '#5A6480' }}>
                {m}M
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#5A6480' }}>Loading analytics…</div>
        ) : (
          <>
            {/* Area trend */}
            <Section title="COMPLAINT VOLUME TREND">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="gTotal"    x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00B4FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00B4FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00C896" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C896" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
                  <XAxis dataKey="month" tick={{ fill: '#5A6480', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#5A6480', fontSize: 10 }} />
                  <Tooltip contentStyle={TT} />
                  <Area type="monotone" dataKey="total"    stroke="#00B4FF" fill="url(#gTotal)"    name="Total" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="#00C896" fill="url(#gResolved)" name="Resolved" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* Category horizontal bar */}
              <Section title="BY CRIME CATEGORY">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={cats} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,180,255,0.08)" />
                    <XAxis type="number" tick={{ fill: '#5A6480', fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#8892B0', fontSize: 10 }} width={110} />
                    <Tooltip contentStyle={TT} />
                    <Bar dataKey="count" name="Total" radius={[0,4,4,0]}>
                      {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Section>

              {/* Geographic */}
              <Section title="GEOGRAPHIC DISTRIBUTION (TOP STATES)">
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {geo.slice(0, 15).map((g, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#5A6480', width: 18, textAlign: 'right' }}>{i+1}</span>
                      <span style={{ fontSize: 13, color: '#E0E8FF', flex: 1 }}>{g.state}</span>
                      <div style={{ flex: 2, background: 'rgba(0,180,255,0.1)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4,
                          background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i+3) % COLORS.length]})`,
                          width: `${geo[0]?.count ? (g.count / geo[0].count * 100).toFixed(0) : 0}%`,
                          transition: 'width 1s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#00B4FF', width: 30, textAlign: 'right' }}>{g.count}</span>
                    </div>
                  ))}
                  {geo.length === 0 && <p style={{ color: '#5A6480', fontSize: 13 }}>No location data yet</p>}
                </div>
              </Section>
            </div>

            {/* Financial */}
            <Section title={`FINANCIAL LOSS ANALYSIS — Total: ₹${financial.total?.toLocaleString('en-IN') || 0}`}>
              {financial.data.length === 0 ? (
                <p style={{ color: '#5A6480', fontSize: 13 }}>No financial loss data recorded yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Category','Total Loss (₹)','Avg Loss (₹)','Max Loss (₹)','Cases'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11,
                            color: '#00B4FF', borderBottom: '1px solid rgba(0,180,255,0.2)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {financial.data.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(0,180,255,0.06)' }}>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#E0E8FF', textTransform: 'capitalize' }}>
                            {r._id?.replace(/_/g,' ')}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#FF6B35', fontWeight: 700 }}>
                            {r.totalLoss?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#FFD600' }}>
                            {Math.round(r.avgLoss)?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#FF5252' }}>
                            {r.maxLoss?.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#00C896' }}>{r.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
