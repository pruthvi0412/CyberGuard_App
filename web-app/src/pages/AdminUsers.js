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
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, color: '#fff', marginBottom: 4 }}>
            User Management
          </h1>
          <p style={{ color: '#5A6480', fontSize: 13 }}>{total} registered users</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input className="input-cyber" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <select className="input-cyber" value={role} onChange={e => setRole(e.target.value)} style={{ width: 160 }}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="card-cyber" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(13,71,161,0.3)', borderBottom: '1px solid rgba(0,180,255,0.2)' }}>
                  {['Name','Email','Role','Status','Joined','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11,
                      color: '#00B4FF', fontFamily: 'Orbitron,monospace', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#5A6480' }}>Loading…</td></tr>
                ) : users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(0,180,255,0.06)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(0,180,255,0.02)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#E0E8FF' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#0D47A1,#00B4FF)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#8892B0' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                        style={{ background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.2)',
                          color: '#00B4FF', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
                        <option value="user">User</option>
                        <option value="officer">Officer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                        background: u.isActive ? 'rgba(0,200,150,0.1)' : 'rgba(255,82,82,0.1)',
                        color: u.isActive ? '#00C896' : '#FF5252' }}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#5A6480' }}>
                      {format(new Date(u.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleToggle(u._id)}
                        style={{ background: u.isActive ? 'rgba(255,82,82,0.1)' : 'rgba(0,200,150,0.1)',
                          border: `1px solid ${u.isActive ? 'rgba(255,82,82,0.3)' : 'rgba(0,200,150,0.3)'}`,
                          color: u.isActive ? '#FF5252' : '#00C896',
                          borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>
                        {u.isActive ? 'Ban' : 'Unban'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
