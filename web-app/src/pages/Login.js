import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, verify2FA, verifyEmailOtp, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [otpData, setOtpData] = useState(null); // { type: 'email' | 'totp', userId: string }
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form.email, form.password);
      if (res.emailOtpRequired) {
        setOtpData({ type: 'email', userId: res.userId });
        toast.success('6-digit security code sent to your email!', { icon: '📧' });
      } else if (res.mfaRequired) {
        setOtpData({ type: 'totp', userId: res.userId });
        toast('Authenticator App 2FA Required', { icon: '🛡️' });
      } else {
        toast.success(`Welcome back, ${res.name}!`);
        navigate(res.role === 'admin' || res.role === 'officer' ? '/admin' : '/dashboard');
      }
    } catch (err) { 
      toast.error(err.message || 'Login failed'); 
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error('Please enter full 6-digit code');
    try {
      let user;
      if (otpData.type === 'email') {
        user = await verifyEmailOtp(otpData.userId, otpCode);
      } else {
        user = await verify2FA(otpData.userId, otpCode);
      }
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' || user.role === 'officer' ? '/admin' : '/dashboard');
    } catch (err) { 
      toast.error(err.message || 'Verification failed'); 
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#02060A', 
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Liquid Atmospheric Accents */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(160, 32, 240, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ 
            width: 72, height: 72, borderRadius: '22px',
            background: 'linear-gradient(135deg, #007AFF, #00C896)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 20px', boxShadow: '0 20px 40px rgba(0, 122, 255, 0.4)'
          }}>🛡️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>
            Cyber<span style={{ color: '#007AFF' }}>Guard</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontWeight: 500 }}>
            {otpData ? (otpData.type === 'email' ? 'Security OTP Verification' : '2FA Protocol Required') : 'Secure Access Gateway'}
          </p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
        }}>
          <AnimatePresence mode="wait">
            {!otpData ? (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
              >
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, display: 'block' }}>Email Address</label>
                  <input 
                    className="liquid-input" 
                    type="email" 
                    placeholder="you@agency.gov"
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})}
                    required 
                    style={{ 
                      width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px', padding: '16px 20px', color: '#fff', fontSize: '16px', outline: 'none'
                    }} 
                  />
                </div>
                <div style={{ marginBottom: 40 }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, display: 'block' }}>Secure Password</label>
                  <input 
                    className="liquid-input" 
                    type="password" 
                    placeholder="••••••••"
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})}
                    required 
                    style={{ 
                      width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px', padding: '16px 20px', color: '#fff', fontSize: '16px', outline: 'none'
                    }} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    width: '100%', padding: '18px', background: '#007AFF', borderRadius: '16px',
                    border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  {loading ? 'AUTHENTICATING...' : 'SIGN IN →'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleOtpSubmit}
              >
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                    {otpData.type === 'email' ? '📨' : '🛡️'}
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontWeight: 600 }}>
                    {otpData.type === 'email' 
                      ? 'A 6-digit security code was sent to your email.' 
                      : 'Enter the 6-digit verification code from your authenticator app.'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                    Enter the code below to complete sign-in
                  </p>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <input 
                    className="liquid-input" 
                    type="text" 
                    placeholder="••••••" 
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    style={{ 
                      textAlign: 'center', fontSize: '32px', letterSpacing: '12px', fontWeight: 900,
                      width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px', padding: '16px', color: '#fff', outline: 'none'
                    }} 
                    autoFocus
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    width: '100%', padding: '18px', background: '#007AFF', borderRadius: '16px',
                    border: 'none', color: '#fff', fontSize: '16px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  {loading ? 'VERIFYING...' : 'CONFIRM ACCESS'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setOtpData(null); setOtpCode(''); }}
                  style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', 
                    fontSize: '13px', marginTop: 24, cursor: 'pointer', fontWeight: 700 }}
                >
                  ← BACK TO LOGIN
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {!otpData && (
            <div style={{ marginTop: 32 }}>
              <div style={{ 
                padding: '16px', borderRadius: '16px', background: 'rgba(0,122,255,0.05)', 
                border: '1px solid rgba(0,122,255,0.15)', fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.5, marginBottom: 32
              }}>
                <strong style={{ color: '#007AFF' }}>DEMO ADMIN:</strong> admin@cybercrime.gov / Admin@123456
              </div>

              <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                No credentials?{' '}
                <Link to="/register" style={{ color: '#007AFF', textDecoration: 'none', fontWeight: 800 }}>
                  Request Access
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
