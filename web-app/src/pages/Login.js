import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' || user.role === 'officer' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20 }}>

      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage:
        'linear-gradient(rgba(0,180,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg,#0D47A1,#00B4FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 12px' }}>🛡️</div>
          <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, color: '#00B4FF', marginBottom: 4 }}>
            CYBERGUARD
          </h1>
          <p style={{ color: '#5A6480', fontSize: 13 }}>Sign in to your account</p>
        </div>

        <div className="card-cyber">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label>Email Address</label>
              <input className="input-cyber" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                required autoComplete="email" />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label>Password</label>
              <input className="input-cyber" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                required autoComplete="current-password" />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: 15 }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '12px', borderRadius: 8,
            background: 'rgba(0,180,255,0.05)', border: '1px solid rgba(0,180,255,0.15)',
            fontSize: 12, color: '#5A6480' }}>
            <strong style={{ color: '#00B4FF' }}>Demo admin:</strong> admin@cybercrime.gov / Admin@123456
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#5A6480' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#00B4FF', textDecoration: 'none', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
