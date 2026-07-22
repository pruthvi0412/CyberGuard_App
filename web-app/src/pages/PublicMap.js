import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import Navbar from '../components/Navbar';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function PublicMap() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const { data } = await analyticsAPI.publicMapPoints();
        setPoints(data.data.points || []);
      } catch (err) {
        toast.error('Failed to load threat intelligence data');
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const getColor = (severity) => {
    if (severity === 'high') return '#ff4d4d';
    if (severity === 'medium') return '#ffcc00';
    return '#00ffaa';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ flex: 1, position: 'relative' }}>
        
        {/* Statistics Header */}
        <div style={{ 
          position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', 
          zIndex: 1000, background: 'rgba(10,15,30,0.85)', padding: '10px 30px', 
          borderRadius: '30px', border: '1px solid rgba(0,180,255,0.2)', 
          backdropFilter: 'blur(10px)', color: '#00B4FF', 
          fontFamily: 'Orbitron, monospace', fontSize: '12px', letterSpacing: '1px',
          boxShadow: '0 0 30px rgba(0,180,255,0.1)'
        }}>
          LIVE CYBER THREAT INTELLIGENCE FEED • {points.length} ACTIVE INCIDENTS
        </div>

        <MapContainer 
          center={[20.5937, 78.9629]} 
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {points.map((p) => (
            <CircleMarker
              key={p._id}
              center={[p.location.coordinates[1], p.location.coordinates[0]]}
              radius={8}
              pathOptions={{
                fillColor: getColor(p.severity),
                color: '#fff',
                weight: 1,
                fillOpacity: 0.6
              }}
            >
              <Popup>
                <div style={{ minWidth: '150px', background: '#0A0F1E', color: '#fff', padding: '5px' }}>
                  <div style={{ fontSize: '10px', color: getColor(p.severity), fontWeight: 'bold', marginBottom: '5px', fontFamily: 'Orbitron, monospace' }}>
                    {p.severity.toUpperCase()} THREAT
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>{p.category}</div>
                  <div style={{ fontSize: '11px', color: '#8892B0' }}>Anonymized Report Source</div>
                  <div style={{ marginTop: '10px', fontSize: '9px', color: '#5A6480', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                    Verified by CyberGuard AI
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div style={{ 
          position: 'absolute', bottom: '30px', right: '20px', zIndex: 1000, 
          background: 'rgba(10,15,30,0.85)', padding: '15px', borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#00B4FF', fontFamily: 'Orbitron, monospace' }}>THREAT LEVELS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px', color: '#E0E8FF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4d' }}></span> Critical Fraud
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffcc00' }}></span> Medium Vulnerability
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ffaa' }}></span> Low Risk Activity
            </div>
          </div>
        </div>

      </div>
      <style>{`
        .leaflet-container { background: #030a0f !important; }
        .leaflet-popup-content-wrapper { background: #0a0f1e !important; color: #fff !important; border: 1px solid rgba(0,180,255,0.2) !important; }
        .leaflet-popup-tip { background: #0a0f1e !important; }
      `}</style>
    </div>
  );
}
