import React from 'react';
import { useNavigate } from 'react-router-dom';
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'#0A0F1E', display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 20 }}>
      <div style={{ fontFamily:'Orbitron,monospace', fontSize: 80, color:'rgba(0,180,255,0.15)', fontWeight: 900 }}>404</div>
      <h1 style={{ fontFamily:'Orbitron,monospace', fontSize: 22, color:'#00B4FF' }}>PAGE NOT FOUND</h1>
      <p style={{ color:'#5A6480', fontSize: 14 }}>The page you're looking for doesn't exist.</p>
      <button className="btn-primary" onClick={() => navigate('/')} style={{ padding:'12px 32px' }}>
        ← Back to Home
      </button>
    </div>
  );
}
