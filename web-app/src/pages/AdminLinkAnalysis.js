import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function AdminLinkAnalysis() {
  const [links, setLinks] = useState({ phones: [], upis: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await analyticsAPI.linkAnalysis();
        setLinks(data.data.links);
      } catch (err) {
        toast.error('Failed to load link analysis data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderSection = (title, items, type) => (
    <div style={{ marginBottom: '60px' }}>
      <h3 style={{ 
        fontSize: '14px', 
        fontWeight: 800,
        color: 'rgba(255,255,255,0.3)', 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        <span style={{ fontSize: '24px' }}>{type === 'phone' ? '📱' : '💳'}</span>
        {title} ({items.length})
      </h3>

      <div style={{ display: 'grid', gap: '20px' }}>
        {items.length === 0 ? (
          <div style={{ 
            color: 'rgba(255,255,255,0.3)', 
            padding: '48px', 
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)', 
            borderRadius: '24px',
            textAlign: 'center',
            fontSize: '15px'
          }}>
            No serial suspect identifiers found for this category.
          </div>
        ) : (
          items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.05)' }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '32px',
                transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#007AFF', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                    SUSPECT IDENTIFIER
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#FF3B30', letterSpacing: '-0.5px' }}>
                    {item._id}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{item.count}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginTop: 4, letterSpacing: '1px' }}>LINKED CASES</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {item.cases.map((c, i) => (
                  <a 
                    key={i}
                    href={`/admin/complaints?search=${c.id}`}
                    style={{
                      background: 'rgba(0,122,255,0.1)',
                      border: '1px solid rgba(0,122,255,0.2)',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      textDecoration: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(0,122,255,0.2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(0,122,255,0.1)'}
                  >
                    <span style={{ fontWeight: 800, color: '#007AFF', letterSpacing: '0.5px' }}>{c.id}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{c.category}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
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
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <div style={{ 
        maxWidth: 1000, 
        margin: '0 auto', 
        padding: '80px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ marginBottom: 64 }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 800,
            background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 12px 0',
            letterSpacing: '-1.5px'
          }}>
            Suspect <span style={{ color: '#007AFF' }}>Link Analysis</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', fontWeight: 400 }}>
            Advanced forensic tool to identify cross-case connections and serial scam operations.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px' }}>
            AGGREGATING FORENSIC INTELLIGENCE...
          </div>
        ) : (
          <div>
            {renderSection('LINKED PHONE NUMBERS', links.phones, 'phone')}
            {renderSection('LINKED UPI IDENTIFIERS', links.upis, 'upi')}
          </div>
        )}

        <div style={{ 
          marginTop: '100px', 
          padding: '40px',
          background: 'rgba(255, 59, 48, 0.03)',
          backdropFilter: 'blur(40px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 59, 48, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#FF3B30', fontWeight: 800, letterSpacing: '1px' }}>🛡️ INVESTIGATOR PROTOCOL</h4>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.7', margin: 0 }}>
            These links are generated automatically via OCR text extraction. Please verify identifiers within original evidence screenshots before initiating legal action. Multiple reports against the same identifier indicate high-confidence serial activity.
          </p>
        </div>
      </div>
    </div>
  );
}
