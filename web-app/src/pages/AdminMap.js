import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon creator
const createCustomIcon = (severity) => {
  const color = severity === 'high' ? '#ff4d4d' : severity === 'medium' ? '#ffcc00' : '#00ffaa';
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

export default function AdminMap() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const { data } = await analyticsAPI.mapPoints();
        setPoints(data.data.points || []);
      } catch (err) {
        toast.error('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(10,15,30,0.8)', color: '#00B4FF', fontFamily: 'Orbitron, monospace' }}>
            SCANNING GEOGRAPHIC DATA...
          </div>
        ) : (
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {points.map((p) => (
              <Marker 
                key={p._id} 
                position={[p.location.coordinates[1], p.location.coordinates[0]]}
                icon={createCustomIcon(p.severity)}
              >
                <Popup>
                  <div style={{ minWidth: '180px', color: '#fff', background: '#0a0f1e', padding: '2px' }}>
                    <div style={{ fontSize: '9px', color: '#00B4FF', marginBottom: '4px', fontWeight: 'bold', fontFamily: 'Orbitron, monospace' }}>
                      {p.complaintId} • {p.severity.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#fff' }}>{p.title}</div>
                    <div style={{ fontSize: '10px', color: '#8892B0', marginBottom: '8px' }}>
                      Category: {p.category.replace(/_/g, ' ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '5px' }}>
                      <span style={{ fontSize: '9px', color: '#5A6480' }}>
                        {format(new Date(p.createdAt), 'dd MMM yyyy')}
                      </span>
                      <a 
                        href={`/track/${p.complaintId}`} 
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '9px', color: '#00ffaa', textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        VIEW CASE →
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        
        {/* Overlay Legend */}
        <div style={{ 
          position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, 
          background: 'rgba(10,15,30,0.85)', padding: '15px', borderRadius: '8px', 
          border: '1px solid rgba(0,180,255,0.2)', backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
          <h4 style={{ fontSize: '12px', margin: '0 0 10px 0', color: '#00B4FF', fontFamily: 'Orbitron, monospace', letterSpacing: '1px' }}>HOTSPOT MONITOR</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#E0E8FF' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 8px #ff4d4d' }}></span> High Priority
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#E0E8FF' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffcc00', boxShadow: '0 0 8px #ffcc00' }}></span> Medium Priority
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#E0E8FF' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00ffaa', boxShadow: '0 0 8px #00ffaa' }}></span> Low Priority
            </div>
          </div>
          <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', color: '#5A6480', textAlign: 'center' }}>
            ACTIVE INCIDENTS: {points.length}
          </div>
        </div>
      </div>
      
      {/* GLOBAL CSS FOR LEAFLET POPUPS */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #0a0f1e !important;
          color: #fff !important;
          border: 1px solid rgba(0,180,255,0.2) !important;
          border-radius: 4px !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-popup-tip {
          background: #0a0f1e !important;
          border: 1px solid rgba(0,180,255,0.2) !important;
        }
        .leaflet-container {
          background: #030a0f !important;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
