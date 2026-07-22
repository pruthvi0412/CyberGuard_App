import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { adminAPI } from '../services/api';

export default function AdminMails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getEmails({ page, limit: 20 });
      if (data.status === 'success') {
        setEmails(data.data.emails);
        setTotal(data.data.total);
      }
    } catch { 
      toast.error('Failed to load email logs'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchEmails(); 
  }, [page]);

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
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 180, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 180, 255, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '80px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 800,
            background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 12px 0',
            letterSpacing: '-1.5px',
            fontFamily: 'Orbitron, monospace'
          }}>
            Network <span style={{ color: '#00B4FF' }}>Mails</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', fontWeight: 400 }}>
            Monitor automated communications dispatched to users regarding their filings ({total} total).
          </p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {['Timestamp', 'Recipient', 'Complaint ID', 'Subject', 'Message Body'].map(h => (
                    <th key={h} style={{ 
                      padding: '24px 32px', textAlign: 'left', fontSize: '11px',
                      color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' 
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 80, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: 800, letterSpacing: '2px' }}>RETRIEVING COMMUNICATIONS LOG...</td></tr>
                ) : emails.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 80, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: 800, letterSpacing: '2px' }}>NO COMMUNICATIONS LOGGED</td></tr>
                ) : emails.map((mail, i) => (
                  <motion.tr 
                    key={mail._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    <td style={{ padding: '24px 32px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {format(new Date(mail.sentAt), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td style={{ padding: '24px 32px', fontSize: '14px', color: '#fff', fontWeight: 600 }}>
                      {mail.recipient}
                    </td>
                    <td style={{ padding: '24px 32px' }}>
                      <div style={{ 
                        background: 'rgba(0,180,255,0.1)', border: '1px solid rgba(0,180,255,0.3)',
                        color: '#00B4FF', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', 
                        fontWeight: 800, display: 'inline-block', letterSpacing: '1px', fontFamily: 'Orbitron, monospace'
                      }}>
                        {mail.complaintId || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px', fontSize: '13px', color: '#E0E0E0', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mail.subject}
                    </td>
                    <td style={{ padding: '24px 32px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, maxWidth: '300px' }}>
                      <div style={{ 
                        maxHeight: '60px', overflowY: 'auto', paddingRight: '8px',
                        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'
                      }}>
                        {mail.body.split('\n').map((line, idx) => (
                          <React.Fragment key={idx}>
                            {line}<br/>
                          </React.Fragment>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {total > 20 && (
            <div style={{ 
              padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: page === 1 ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '8px',
                  padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                PREVIOUS
              </button>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                PAGE {page} OF {Math.ceil(total / 20)}
              </span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: page >= Math.ceil(total / 20) ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '8px',
                  padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: page >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer'
                }}
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
