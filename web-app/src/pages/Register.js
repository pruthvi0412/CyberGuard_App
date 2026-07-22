import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading } = useAuthStore();
  
  // Get role from URL query: /register?role=admin
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role') || 'user';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) e.email = 'Invalid email';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = 'Must contain upper, lower and number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password,
        role: role
      });
      toast.success(`Account created! Welcome, ${role}.`);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const roleColors = {
    admin: { main: '#007AFF', accent: '#00B4FF', glow: 'rgba(0, 122, 255, 0.15)', bg: 'rgba(0, 122, 255, 0.05)' },
    officer: { main: '#FF8F00', accent: '#FFD600', glow: 'rgba(255, 143, 0, 0.15)', bg: 'rgba(255, 143, 0, 0.05)' },
    education: { main: '#7C3AED', accent: '#A855F7', glow: 'rgba(124, 58, 237, 0.15)', bg: 'rgba(124, 58, 237, 0.05)' },
    user: { main: '#00C853', accent: '#00ffaa', glow: 'rgba(0, 200, 83, 0.15)', bg: 'rgba(0, 200, 83, 0.05)' }
  };

  const theme = roleColors[role] || roleColors.user;

  const field = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 24 }}>
      <label style={{ 
        display: 'block', 
        fontSize: '13px', 
        fontWeight: 700, 
        color: 'rgba(255,255,255,0.4)', 
        marginBottom: '10px', 
        marginLeft: '12px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input 
          className="liquid-input"
          type={type} 
          placeholder={placeholder}
          value={form[key]} 
          onChange={e => setForm({...form, [key]: e.target.value})}
          style={{ 
            width: '100%',
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: '18px',
            color: '#fff',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        {errors[key] && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#FF3B30', fontSize: '12px', marginTop: '6px', marginLeft: '12px', fontWeight: 600 }}>
            {errors[key]}
          </motion.p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#02060A', 
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Dynamic Role-Based Background Accents */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '60%', height: '60%', background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
            style={{ 
              width: 72, height: 72, borderRadius: '22px',
              background: `linear-gradient(135deg, ${theme.main}, ${theme.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 24px',
              boxShadow: `0 15px 35px ${theme.glow}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0.2), transparent)', opacity: 0.5 }} />
            {role === 'admin' ? '⚡' : role === 'officer' ? '👮' : role === 'education' ? '🎓' : '🛡️'}
          </motion.div>
          <h1 style={{ 
            fontSize: '2.4rem', 
            fontWeight: 800,
            color: '#fff', 
            marginBottom: '8px',
            letterSpacing: '-1px'
          }}>
            Create <span style={{ color: theme.accent }}>{role.charAt(0).toUpperCase() + role.slice(1)}</span> Account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>
            {role === 'admin' ? 'Establish Command Center clearance' : 
             role === 'officer' ? 'Access investigative tools and logs' :
             role === 'education' ? 'Join the cyber learning community' :
             'Secure your presence in the network'}
          </p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid rgba(255, 255, 255, 0.08)`,
          borderRadius: '32px',
          padding: '48px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            {field('name',    'Full Name',    'text',     'John Doe')}
            {field('email',   'Email Address', 'email',    'you@example.com')}
            {field('phone',   'Phone (Optional)', 'tel', '9XXXXXXXXX')}
            {field('password','Secure Password', 'password', '••••••••')}
            {field('confirm', 'Confirm Password','password','••••••••')}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '18px', 
                fontSize: '16px', 
                fontWeight: 800,
                marginTop: '12px',
                background: `linear-gradient(135deg, ${theme.main} 0%, ${theme.accent} 100%)`,
                color: (role === 'admin' || role === 'education') ? '#fff' : '#000',
                border: 'none',
                borderRadius: '18px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: `0 10px 25px ${theme.glow}`,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 15px 35px ${theme.glow}`;
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 10px 25px ${theme.glow}`;
              }}
            >
              {loading ? 'INITIALIZING...' : 'ESTABLISH ACCOUNT →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: theme.accent, textDecoration: 'none', fontWeight: 800 }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <style>
        {`
          .liquid-input:focus {
            background: rgba(255,255,255,0.06) !important;
            border-color: ${theme.accent} !important;
            box-shadow: 0 0 0 4px ${theme.glow}, inset 0 2px 4px rgba(0,0,0,0.1) !important;
          }
          button:active { transform: scale(0.96) !important; }
        `}
      </style>
    </div>
  );
}
