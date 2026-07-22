import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function LeakMonitor() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const checkBreach = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulated Leak Check Logic
    // In a real app, you would fetch from HaveIBeenPwned or a similar API
    setTimeout(() => {
      const mockBreaches = [
        { name: 'Adobe', date: 'Oct 2013', details: 'Email, Hint, Password, Username' },
        { name: 'LinkedIn', date: 'May 2016', details: 'Email, Password' },
        { name: 'Canva', date: 'May 2019', details: 'Email, Name, Password, Username' },
        { name: 'MySpace', date: 'May 2016', details: 'Email, Password, Username' }
      ];

      // Randomly pick 0-3 breaches for simulation
      const foundCount = Math.floor(Math.random() * 4);
      const foundBreaches = mockBreaches.slice(0, foundCount);

      setResult({
        email,
        found: foundCount > 0,
        breaches: foundBreaches,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }, 2000);
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
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(255, 59, 48, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(255, 59, 48, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <div style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        padding: '80px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <h1 style={{ 
            fontSize: '3.4rem', 
            fontWeight: 800,
            background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px 0',
            letterSpacing: '-1.5px'
          }}>
            Dark Web <span style={{ color: '#FF3B30' }}>Leak Monitor</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 400, maxWidth: 600, margin: '0 auto' }}>
            Verify if your digital identity has been exposed in global data breaches. 
          </p>
        </motion.div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          marginBottom: '60px'
        }}>
          <form onSubmit={checkBreach} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="liquid-input"
              style={{
                flex: 1,
                minWidth: '280px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '18px',
                padding: '18px 24px',
                color: '#fff',
                outline: 'none',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)',
                border: 'none',
                borderRadius: '18px',
                padding: '0 32px',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '14px',
                letterSpacing: '0.5px',
                boxShadow: loading ? 'none' : '0 10px 25px rgba(255, 59, 48, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'ANALYZING...' : 'CHECK FOR LEAKS'}
            </button>
          </form>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {!result.found ? (
                <div style={{ 
                  background: 'rgba(0, 255, 170, 0.03)', 
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(0, 255, 170, 0.1)', 
                  borderRadius: '32px', 
                  padding: '60px 40px',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛡️</div>
                  <h2 style={{ color: '#00ffaa', fontSize: '24px', fontWeight: 800, margin: '0 0 12px 0' }}>Clean Identification</h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0, lineHeight: 1.6 }}>
                    No compromises found for <strong>{result.email}</strong> in historical archives.
                  </p>
                </div>
              ) : (
                <div style={{ 
                  background: 'rgba(255, 59, 48, 0.03)', 
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 59, 48, 0.1)', 
                  borderRadius: '32px', 
                  padding: '48px',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
                    <div style={{ 
                      width: 72, height: 72, borderRadius: '22px', 
                      background: 'rgba(255, 59, 48, 0.1)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontSize: '32px'
                    }}>⚠️</div>
                    <div>
                      <h2 style={{ color: '#FF3B30', fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0' }}>Compromised Records Found</h2>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0 }}>
                        Your identity was exposed in <strong>{result.breaches.length}</strong> identified breaches.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '20px' }}>
                    {result.breaches.map((b, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          padding: '24px 32px', 
                          borderRadius: '24px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderLeft: '4px solid #FF3B30'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 700 }}>{b.name}</h4>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>{b.date}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>DATA LEAKED:</strong> {b.details}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div style={{ 
                    marginTop: '40px', padding: '32px', background: 'rgba(255, 255, 255, 0.02)', 
                    borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' 
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#fff', fontWeight: 800, letterSpacing: '1px' }}>SECURITY ADVISORY:</h4>
                    <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', paddingLeft: '20px', lineHeight: '1.8' }}>
                      <li>Reset passwords for all listed platforms immediately.</li>
                      <li>Deploy Multi-Factor Authentication across all critical accounts.</li>
                      <li>Audit your digital footprint for any unrecognized activity.</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '100px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          <p>Powered by CyberGuard Breach Intelligence Network. Data is simulated for demonstration purposes.</p>
        </div>
      </div>

      <style>
        {`
          .liquid-input:focus {
            background: rgba(255,255,255,0.04) !important;
            border-color: #FF3B30 !important;
            box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.1) !important;
          }
        `}
      </style>
    </div>
  );
}
