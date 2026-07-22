import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function AdminML() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testText, setTestText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await adminAPI.mlStatus();
      setStatus(data.data);
    } catch (e) {
      toast.error('Could not connect to ML Service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handlePredict = async () => {
    if (!testText.trim()) return;
    setPredicting(true);
    try {
      const { data } = await adminAPI.predict(testText);
      setPrediction(data.data);
    } catch (e) {
      const msg = e.response?.data?.message || 'Prediction failed';
      toast.error(msg);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 24, color: '#fff', marginBottom: 8 }}>Neural Engine Settings</h1>
          <p style={{ color: '#5A6480' }}>Monitor and test the AI classification model</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          {/* Status Card */}
          <div className="card-cyber" style={{ padding: 24, border: '1px solid rgba(156, 39, 176, 0.2)' }}>
            <h3 style={{ fontSize: 14, color: '#00B4FF', marginBottom: 20, fontFamily: 'Orbitron,monospace' }}>SYSTEM STATUS</h3>
            {loading ? (
              <p style={{ color: '#5A6480' }}>Checking connection...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 12, height: 12, borderRadius: '50%', 
                    background: (status?.mlService?.status === 'online' || status?.mlService?.status === 'ok') ? '#00FFD1' : '#FF5252',
                    boxShadow: (status?.mlService?.status === 'online' || status?.mlService?.status === 'ok') ? '0 0 10px #00FFD1' : 'none'
                  }} />
                  <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>
                    {(status?.mlService?.status === 'online' || status?.mlService?.status === 'ok') ? 'SERVICE OPERATIONAL' : 'SERVICE OFFLINE'}
                  </span>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#5A6480', fontSize: 12 }}>Model Version</span>
                    <span style={{ color: '#E0E8FF', fontSize: 12 }}>{status?.modelInfo?.version || 'v1.0.4-stable'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#5A6480', fontSize: 12 }}>Algorithm</span>
                    <span style={{ color: '#E0E8FF', fontSize: 12 }}>TF-IDF + Logistic Regression</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5A6480', fontSize: 12 }}>Accuracy</span>
                    <span style={{ color: '#00FFD1', fontSize: 12, fontWeight: 700 }}>{status?.modelInfo?.accuracy || '94.8'}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Testing */}
          <div className="card-cyber" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, color: '#00B4FF', marginBottom: 20, fontFamily: 'Orbitron,monospace' }}>MODEL PLAYGROUND</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea 
                className="input-cyber" 
                rows={4} 
                placeholder="Enter a crime description to test AI classification..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                style={{ resize: 'none' }}
              />
              <button 
                className="btn-primary" 
                onClick={handlePredict} 
                disabled={predicting || !testText.trim()}
                style={{ width: '100%' }}
              >
                {predicting ? 'ANALYZING...' : 'RUN INFERENCE'}
              </button>
            </div>

            {prediction && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 20, padding: 16, background: 'rgba(0,180,255,0.05)', borderRadius: 8, border: '1px solid rgba(0,180,255,0.1)' }}
              >
                <div style={{ fontSize: 11, color: '#5A6480', marginBottom: 4, textTransform: 'uppercase' }}>Prediction Result</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#00FFD1', fontWeight: 700, fontSize: 18 }}>{prediction.category}</span>
                  <span style={{ color: '#00B4FF', fontSize: 12 }}>{Math.round(prediction.confidence * 100)}% Conf.</span>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
