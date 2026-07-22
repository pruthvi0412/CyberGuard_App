import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { adminAPI } from '../services/api';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [total,   setTotal]   = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search: search || undefined, role: role || undefined, limit: 20 });
      setUsers(data.data.users);
      setTotal(data.data.total);
    } catch { toast.error('Failed to load users'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, role]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateRole(userId, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleToggle = async (userId) => {
    try {
      await adminAPI.toggleStatus(userId);
      toast.success('User status toggled');
      fetchUsers();
    } catch { toast.error('Failed to toggle status'); }
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
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
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
            letterSpacing: '-1.5px'
          }}>
            User <span style={{ color: '#007AFF' }}>Management</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', fontWeight: 400 }}>
            Oversee and regulate the authorized personnel of the CyberGuard network ({total} entries).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <input 
            className="liquid-input"
            placeholder="Search by name or email…"
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ 
              flex: 1,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '18px',
              padding: '16px 24px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none',
              transition: '0.3s'
            }} 
          />
          <select 
            className="liquid-select"
            value={role} 
            onChange={e => setRole(e.target.value)} 
            style={{ 
              width: 180,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '18px',
              padding: '0 16px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">All Clearances</option>
            <option value="user">User</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
            <option value="education">Education</option>
          </select>
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
                  {['Clearance Terminal','Digital Signature','Authorization','Protocol','Registration','Security Actions'].map(h => (
                    <th key={h} style={{ 
                      padding: '24px 32px', textAlign: 'left', fontSize: '11px',
                      color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' 
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 80, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: 800, letterSpacing: '2px' }}>INITIALIZING DATABASE HANDLER...</td></tr>
                ) : [...users].sort((a,b) => {
                  if (a.email === 'pruthvishetty04@gmail.com') return -1;
                  if (b.email === 'pruthvishetty04@gmail.com') return 1;
                  return 0;
                }).map((u, i) => {
                  const isOwner = u.email === 'pruthvishetty04@gmail.com';
                  return (
                  <motion.tr 
                    key={u._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    <td style={{ padding: '24px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ 
                          width: 44, height: 44, borderRadius: '16px',
                          background: `linear-gradient(135deg, ${isOwner ? '#00B4FF, #00FF88' : u.role === 'admin' ? '#007AFF, #00B4FF' : u.role === 'officer' ? '#FF8F00, #FFD600' : '#00C853, #00ffaa'})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                          fontSize: '16px', fontWeight: 800, color: (u.role === 'admin' || isOwner ? '#fff' : '#000'), flexShrink: 0,
                          boxShadow: isOwner ? '0 0 20px rgba(0, 180, 255, 0.5)' : '0 8px 15px rgba(0,0,0,0.2)'
                        }}>
                          {isOwner ? (
                            <img src="http://localhost:5002/uploads/avatars/avatar-69f85f6e9abdc8a99deb2036-1778826766867.jpeg" alt="Owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            u.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', textShadow: isOwner ? '0 0 10px rgba(0,180,255,0.8)' : 'none' }}>
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '24px 32px', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{u.email}</td>
                    <td style={{ padding: '24px 32px' }}>
                      {isOwner ? (
                        <div style={{ 
                          background: 'rgba(0,180,255,0.1)', border: '1px solid #00B4FF',
                          color: '#00B4FF', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', 
                          fontWeight: 800, display: 'inline-block', letterSpacing: '1px'
                        }}>
                          OWNER
                        </div>
                      ) : (
                        <select 
                          value={u.role} 
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          style={{ 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', 
                            fontWeight: 700, cursor: 'pointer', outline: 'none'
                          }}
                        >
                          <option value="user">USER</option>
                          <option value="officer">OFFICER</option>
                          <option value="admin">ADMIN</option>
                          <option value="education">EDUCATION</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '24px 32px' }}>
                      <span style={{ 
                        padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 800,
                        background: u.isActive ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                        color: u.isActive ? '#00ffaa' : '#FF3B30',
                        border: `1px solid ${u.isActive ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255, 59, 48, 0.2)'}`,
                        textTransform: 'uppercase', letterSpacing: '1px'
                      }}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td style={{ padding: '24px 32px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                      {format(new Date(u.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td style={{ padding: '24px 32px' }}>
                      {isOwner ? (
                        <div style={{ color: '#00FF88', fontWeight: 800, fontSize: '12px', letterSpacing: '2px' }}>
                          SECURED
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleToggle(u._id)}
                          style={{ 
                            background: u.isActive ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 255, 170, 0.1)',
                            border: `1px solid ${u.isActive ? '#FF3B3033' : '#00ffaa33'}`,
                            color: u.isActive ? '#FF3B30' : '#00ffaa',
                            borderRadius: '12px', padding: '10px 20px', fontSize: '12px', 
                            fontWeight: 800, cursor: 'pointer', transition: '0.3s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = u.isActive ? 'rgba(255, 59, 48, 0.2)' : 'rgba(0, 255, 170, 0.2)'}
                          onMouseOut={e => e.currentTarget.style.background = u.isActive ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 255, 170, 0.1)'}
                        >
                          {u.isActive ? 'TERMINATE' : 'RESTORE'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
