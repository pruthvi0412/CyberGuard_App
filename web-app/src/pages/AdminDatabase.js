import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { complaintsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDatabase() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await complaintsAPI.getAll({ limit: 100 });
      setData(res.data.data.complaints);
    } catch (err) {
      toast.error('Failed to sync database records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.complaintId.toLowerCase().includes(search.toLowerCase()) ||
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const JsonView = ({ obj }) => (
    <div style={{ 
      fontFamily: '"Fira Code", monospace', 
      fontSize: 13, 
      lineHeight: 1.6, 
      color: '#A9B1D6', 
      paddingLeft: 20,
      borderLeft: '1px solid rgba(255,255,255,0.05)'
    }}>
      {Object.entries(obj).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 4 }}>
          <span style={{ color: '#00B4FF', fontWeight: 600 }}>{key}</span>: 
          {typeof value === 'object' && value !== null ? (
            <JsonView obj={value} />
          ) : (
            <span style={{ 
              color: typeof value === 'number' ? '#FF9E64' : 
                     typeof value === 'boolean' ? '#BB9AF7' : 
                     '#9ECE6A',
              marginLeft: 8 
            }}>
              {JSON.stringify(value)}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#030a0f' }}>
      <Navbar />
      
      <main style={{ padding: '40px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: 28, margin: 0 }}>Core Database</h1>
              <p style={{ color: '#5A6480', fontSize: 13, marginTop: 4 }}>Live intelligence repository and raw record analysis</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                className="input-cyber" 
                placeholder="Search reference ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 300, background: 'rgba(255,255,255,0.02)' }}
              />
              <button className="btn-outline" onClick={fetchData} style={{ padding: '0 20px' }}>
                REFRESH
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 100, textAlign: 'center', color: '#00B4FF' }}>
              <div className="neural-loader"></div>
              <p style={{ marginTop: 20, fontFamily: 'Orbitron, monospace', fontSize: 12 }}>QUERYING DATA LAKE...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {filteredData.map((record, i) => (
                <motion.div 
                  key={record._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-cyber"
                  style={{ 
                    padding: 0, 
                    overflow: 'hidden', 
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ 
                    padding: '12px 24px', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FFD1', boxShadow: '0 0 10px #00FFD1' }} />
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: '#fff' }}>RECORD: {record.complaintId}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#5A6480', fontFamily: 'monospace' }}>_id: {record._id}</span>
                  </div>
                  
                  <div style={{ padding: 24 }}>
                    <JsonView obj={record} />
                  </div>
                </motion.div>
              ))}

              {filteredData.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 12 }}>
                  <p style={{ color: '#5A6480', fontSize: 14 }}>No records found matching your query.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .neural-loader {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(0, 180, 255, 0.1);
          border-top: 2px solid #00B4FF;
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
