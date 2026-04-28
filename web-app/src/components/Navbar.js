import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isOfficer } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLink = (to, label) => (
    <Link to={to} style={{
      color: location.pathname === to ? '#00B4FF' : '#8892B0',
      textDecoration: 'none', fontSize: 14, fontWeight: 500,
      borderBottom: location.pathname === to ? '2px solid #00B4FF' : '2px solid transparent',
      paddingBottom: 2, transition: 'color 0.2s'
    }}>{label}</Link>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,180,255,0.15)',
      padding: '0 32px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 60,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, color: '#00B4FF', fontWeight: 700 }}>
            CYBERGUARD
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {navLink('/dashboard', 'My Complaints')}
          {navLink('/submit', '+ File Complaint')}
          {isOfficer() && navLink('/admin', 'Admin Panel')}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 13, color: '#5A6480' }}>
          <span style={{ color: '#00FFD1' }}>●</span>{' '}
          {user?.name} •{' '}
          <span style={{ color: '#00B4FF', textTransform: 'uppercase', fontSize: 11 }}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} className="btn-outline"
          style={{ padding: '6px 16px', fontSize: 12 }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
