import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { complaintsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ScamSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.length < 5) {
      toast.error('Search query must be at least 5 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await complaintsAPI.publicSearch(query);
      setResults(data.data.results);
      setSearched(true);
    } catch (err) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(0, 255, 170, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <div style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ 
              fontSize: '3.4rem', 
              fontWeight: 800,
              background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 16px 0',
              letterSpacing: '-1.5px'
            }}>
              Scam <span style={{ color: '#00B4FF' }}>Search Engine</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 400 }}>
              Verify Phone Numbers, UPI IDs, or Accounts against criminal records.
            </p>
          </div>

          <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto 80px' }}>
            <input
              type="text"
              placeholder="Enter Phone, UPI, or Account Number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="liquid-input"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '22px 32px',
                paddingRight: '160px',
                color: '#fff',
                fontSize: '18px',
                outline: 'none',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                bottom: '10px',
                background: 'linear-gradient(135deg, #007AFF 0%, #00B4FF 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '0 28px',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '14px',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(0, 122, 255, 0.3)'
              }}
              onMouseOver={e => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseOut={e => !loading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? 'SCANNING...' : 'SEARCH DB'}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'left' }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px',
                padding: '0 8px'
              }}>
                <h3 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0, fontWeight: 800, letterSpacing: '1px' }}>
                  QUERY RESULTS ({results.length})
                </h3>
                {results.length > 0 && (
                  <motion.span 
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ color: '#FF3B30', fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}
                  >
                    ⚠️ HIGH-RISK IDENTIFIER DETECTED
                  </motion.span>
                )}
              </div>

              {results.length === 0 ? (
                <div style={{ 
                  background: 'rgba(0, 255, 170, 0.03)', 
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(0, 255, 170, 0.1)', 
                  borderRadius: '32px', 
                  padding: '60px 40px',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🟢</div>
                  <h4 style={{ color: '#00ffaa', fontSize: '20px', fontWeight: 800, margin: '0 0 12px 0' }}>Clean Verification</h4>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', margin: 0, lineHeight: 1.6 }}>
                    This credential does not exist in our criminal index. Proceed with standard caution.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {results.map((r, i) => (
                    <motion.div
                      key={r.complaintId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.05)' }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        padding: '24px 32px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', color: '#00B4FF', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>
                          RECORD ID: {r.complaintId}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                          {r.category}
                        </div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                          Filed {format(new Date(r.createdAt), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '6px 14px', 
                          borderRadius: '10px',
                          background: r.severity === 'high' ? 'rgba(255,59,48,0.1)' : 'rgba(0,122,255,0.1)',
                          color: r.severity === 'high' ? '#FF3B30' : '#007AFF',
                          fontWeight: 800,
                          border: `1px solid ${r.severity === 'high' ? '#FF3B3033' : '#007AFF33'}`,
                          letterSpacing: '1px'
                        }}>
                          {r.severity.toUpperCase()} PRIORITY
                        </span>
                        <a 
                          href={`/track/${r.complaintId}`} 
                          style={{ 
                            fontSize: '13px', 
                            color: '#00ffaa', 
                            textDecoration: 'none',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          CASE DETAILS <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ 
          marginTop: '100px', 
          padding: '30px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.3)', 
          fontSize: '13px', 
          lineHeight: '1.6',
          textAlign: 'left'
        }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>SECURITY PROTOCOL:</strong> This interface provides a live gateway into the national criminal index. A "Clean Verification" indicates no active matches in our data store but does not imply absolute safety. Report any suspicious digital activity immediately.
          </p>
        </div>
      </div>

      <style>
        {`
          .liquid-input:focus {
            background: rgba(255,255,255,0.06) !important;
            border-color: #007AFF !important;
            box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15), 0 20px 40px rgba(0,0,0,0.4) !important;
          }
        `}
      </style>
    </div>
  );
}
