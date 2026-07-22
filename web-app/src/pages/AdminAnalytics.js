import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { analyticsAPI } from '../services/api';

const COLORS = ['#007AFF','#00FFD1','#FF2D55','#FF9500','#AF52DE','#34C759','#FF3B30','#5856D6','#FFCC00','#E91E63','#8E8E93'];
const TT = { 
  background:'rgba(10, 20, 40, 0.8)', 
  backdropFilter: 'blur(20px)',
  border:'1px solid rgba(255,255,255,0.1)', 
  borderRadius: '16px',
  color:'#fff', 
  fontSize: '12px',
  padding: '12px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

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

  const Section = ({ title, children, full = false }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        gridColumn: full ? 'span 2' : 'span 1',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '32px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #007AFF, transparent)' }} />
      <h3 style={{ 
        fontSize: '12px', 
        color: 'rgba(255,255,255,0.3)', 
        marginBottom: '32px', 
        fontWeight: 800, 
        letterSpacing: '2px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#007AFF', boxShadow: '0 0 10px #007AFF' }} />
        {title}
      </h3>
      {children}
    </motion.div>
  );

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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, gap: 24 }}>
          <div>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 900, 
              background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-2px',
              margin: '0 0 12px 0'
            }}>Neural <span style={{ color: '#007AFF' }}>Intelligence</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 500 }}>Global threat landscapes and forensic data synthesis.</p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '6px', 
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            {[3,6,12].map(m => (
              <button 
                key={m} 
                onClick={() => setMonths(m)}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '13px', 
                  fontWeight: 800,
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: months === m ? '#007AFF' : 'transparent',
                  border: 'none',
                  color: months === m ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: months === m ? '0 8px 20px rgba(0, 122, 255, 0.3)' : 'none'
                }}>
                {m}M PERIOD
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 120, color: 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: 800, letterSpacing: '2px' }}>SYNTHESIZING NEURAL DATA...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Area trend */}
            <Section title="Complaint Volume Velocity" full>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FFD1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00FFD1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} />
                  <Tooltip contentStyle={TT} />
                  <Area type="monotone" dataKey="total" stroke="#007AFF" fill="url(#gTotal)" name="Total Reports" strokeWidth={4} />
                  <Area type="monotone" dataKey="resolved" stroke="#00FFD1" fill="url(#gResolved)" name="Neutralized Cases" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </Section>

            {/* Category horizontal bar */}
            <Section title="Threat Vector Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cats} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#fff', fontSize: 11, fontWeight: 700 }} width={120} />
                  <Tooltip contentStyle={TT} />
                  <Bar dataKey="count" name="Case Count" radius={[0,12,12,0]} barSize={20}>
                    {cats.map((_, i) => <Cell key={i} fill={`url(#grad${i})`} />)}
                  </Bar>
                  <defs>
                    {cats.map((_, i) => (
                      <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={COLORS[i % COLORS.length]} />
                        <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Section>

            {/* Geographic */}
            <Section title="Geographic Heat (Top Quadrants)">
              <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 10 }}>
                {geo.slice(0, 15).map((g, i) => (
                  <div key={i} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{g.state}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#007AFF' }}>{g.count} IMPACTS</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, height: 8, overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${geo[0]?.count ? (g.count / geo[0].count * 100).toFixed(0) : 0}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ height: '100%', borderRadius: 10, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, transparent)` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Financial */}
            <Section title={`Financial Damage Synthesis — ₹${financial.total?.toLocaleString('en-IN') || 0}`} full>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['CRIME CATEGORY','TOTAL DAMAGE (₹)','AVG IMPACT (₹)','MAX PEAK (₹)','ACTIVE CASES'].map(h => (
                        <th key={h} style={{ 
                          padding: '16px 24px', textAlign: 'left', fontSize: '10px',
                          color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '1px'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {financial.data.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: '0.3s' }}>
                        <td style={{ padding: '20px 24px', fontSize: '14px', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>
                          {r._id?.replace(/_/g,' ')}
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '16px', color: '#FF3B30', fontWeight: 800 }}>
                          ₹{r.totalLoss?.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '14px', color: '#FFD600', fontWeight: 700 }}>
                          ₹{Math.round(r.avgLoss)?.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '14px', color: '#FF2D55', fontWeight: 700 }}>
                          ₹{r.maxLoss?.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{ padding: '6px 12px', background: 'rgba(0,122,255,0.1)', border: '1px solid rgba(0,122,255,0.2)', borderRadius: '8px', color: '#007AFF', fontSize: '12px', fontWeight: 800 }}>
                            {r.count} CASES
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
