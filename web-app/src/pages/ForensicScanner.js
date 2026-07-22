import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const ForensicScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [inputText, setInputText] = useState('');
  const [scanStep, setScanStep] = useState('');
  
  const steps = [
    'Initializing Neural Engine...',
    'Deconstructing Input Vectors...',
    'Analyzing Entropy Patterns...',
    'Cross-referencing Global Threat DBs...',
    'Heuristic Signature Matching...',
    'Finalizing Forensic Integrity Check...'
  ];

  const handleStartScan = () => {
    if (!inputText) {
      toast.error('Please provide a target for analysis (URL, Email, or Hash)');
      return;
    }
    
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishScan();
          return 100;
        }
        
        // Update step text based on progress
        const stepIdx = Math.floor((prev / 100) * steps.length);
        if (stepIdx !== currentStep) {
          currentStep = stepIdx;
          setScanStep(steps[stepIdx]);
        }
        
        return prev + 1;
      });
    }, 50);
  };

  const finishScan = () => {
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        score: Math.floor(Math.random() * 100),
        threatLevel: Math.random() > 0.6 ? 'CRITICAL' : 'MINIMAL',
        findings: [
          { label: 'Entropy Value', value: '0.84 (Suspicious)' },
          { label: 'Origin', value: 'Obfuscated / VPN Detected' },
          { label: 'Encryption', value: 'Custom XOR Stream' },
          { label: 'Signature', value: 'Match: Cobalt Strike v4.2' }
        ]
      });
      toast.success('Forensic Analysis Complete');
    }, 1000);
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
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 255, 170, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <main style={{ 
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
            Neural <span style={{ color: '#00B4FF' }}>Forensic</span> Scanner
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 400, maxWidth: 600, margin: '0 auto' }}>
            Deploy advanced AI heuristics to dissect suspicious digital artifacts in real-time.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isScanning && !scanResult ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '32px',
                padding: '48px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              <textarea 
                className="liquid-input"
                placeholder="Paste suspicious URL, Email body, or File Hash (MD5/SHA256) here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  width: '100%',
                  height: '240px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  padding: '32px',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  resize: 'none',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                onClick={handleStartScan}
                style={{ 
                  background: 'linear-gradient(135deg, #007AFF 0%, #00B4FF 100%)', 
                  border: 'none', 
                  borderRadius: '18px', 
                  padding: '20px', 
                  color: '#fff', 
                  fontWeight: 800, 
                  fontSize: '15px', 
                  letterSpacing: '1px', 
                  cursor: 'pointer', 
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 10px 25px rgba(0, 122, 255, 0.3)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                INITIATE NEURAL SCAN
              </button>
            </motion.div>
          ) : isScanning ? (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px', padding: '40px 0' }}
            >
              <div style={{ 
                width: '300px', height: '300px', borderRadius: '50%', 
                border: '1px solid rgba(0, 180, 255, 0.1)', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(circle, rgba(0, 180, 255, 0.03) 0%, transparent 70%)'
              }}>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ 
                    position: 'absolute', inset: -2, borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 180, 255, 0.3) 100%)',
                    zIndex: 1
                  }}
                />
                <div style={{ 
                  width: '180px', height: '180px', borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 180, 255, 0.2)', display: 'flex', 
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  zIndex: 2, boxShadow: '0 0 50px rgba(0, 180, 255, 0.1)'
                }}>
                  <div style={{ fontSize: '40px', fontWeight: 800, color: '#00B4FF', letterSpacing: '-2px' }}>{scanProgress}%</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Scanning</div>
                </div>
              </div>

              <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#00B4FF', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>{scanStep}</div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div 
                    style={{ height: '100%', background: 'linear-gradient(90deg, #007AFF, #00FFD1)', width: `${scanProgress}%`, boxShadow: '0 0 20px rgba(0, 180, 255, 0.5)' }}
                  />
                </div>
              </div>
              
              <div style={{ 
                width: '100%', maxWidth: '540px', background: 'rgba(0, 0, 0, 0.3)', 
                padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)',
                fontFamily: 'monospace', fontSize: '13px', color: '#00FFD1', 
                display: 'flex', flexDirection: 'column', gap: '8px', backdropFilter: 'blur(20px)'
              }}>
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    style={{ opacity: 0.8 }}
                  >
                    {`> [${new Date().toLocaleTimeString()}] ANALYZING BLOCK_0x${Math.random().toString(16).slice(2, 6).toUpperCase()}...`}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '32px',
                padding: '48px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                <div style={{ 
                  padding: '10px 24px', borderRadius: '14px', 
                  background: scanResult.threatLevel === 'CRITICAL' ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 200, 150, 0.15)',
                  color: scanResult.threatLevel === 'CRITICAL' ? '#FF3B30' : '#00FFD1',
                  fontSize: '12px', fontWeight: 800, letterSpacing: '1px',
                  border: `1px solid ${scanResult.threatLevel === 'CRITICAL' ? '#FF3B3033' : '#00FFD133'}`
                }}>
                  {scanResult.threatLevel} THREAT DETECTED
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, color: scanResult.threatLevel === 'CRITICAL' ? '#FF3B30' : '#00FFD1', letterSpacing: '-2px', lineHeight: 1 }}>{scanResult.score}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '1px', marginTop: 8 }}>THREAT PROBABILITY INDEX</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '48px' }}>
                {scanResult.findings.map((f, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px' }}
                  >
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{f.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{f.value}</div>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <button 
                  onClick={() => { setScanResult(null); setInputText(''); }}
                  style={{ 
                    flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '18px', borderRadius: '16px', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: '0.3s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  NEW SCAN
                </button>
                <button 
                  onClick={() => toast.success('Evidence Packet synchronized with Command Center')}
                  style={{ 
                    flex: 2, background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)', border: 'none', 
                    padding: '18px', borderRadius: '16px', color: '#fff', fontWeight: 800, cursor: 'pointer', transition: '0.3s',
                    boxShadow: '0 10px 25px rgba(255, 59, 48, 0.3)'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  REPORT TO AUTHORITIES
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>
        {`
          .liquid-input:focus {
            background: rgba(255,255,255,0.04) !important;
            border-color: #00B4FF !important;
            box-shadow: 0 0 0 4px rgba(0, 180, 255, 0.1) !important;
          }
        `}
      </style>
    </div>
  );
};

export default ForensicScanner;
