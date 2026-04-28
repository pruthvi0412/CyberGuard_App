import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
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
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 18 }}>
      <label>{label}</label>
      <input className="input-cyber" type={type} placeholder={placeholder}
        value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
      {errors[key] && <p style={{ color: '#FF6B35', fontSize: 12, marginTop: 4 }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage:
        'linear-gradient(rgba(0,180,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,0.03) 1px,transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg,#0D47A1,#00B4FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 12px' }}>🛡️</div>
          <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, color: '#00B4FF', marginBottom: 4 }}>
            Create Account
          </h1>
          <p style={{ color: '#5A6480', fontSize: 13 }}>Join CyberGuard to report cybercrimes</p>
        </div>

        <div className="card-cyber">
          <form onSubmit={handleSubmit}>
            {field('name',    'Full Name',    'text',     'John Doe')}
            {field('email',   'Email',        'email',    'you@example.com')}
            {field('phone',   'Phone Number (optional)', 'tel', '9XXXXXXXXX')}
            {field('password','Password',     'password', 'Min 8 chars, upper+lower+number')}
            {field('confirm', 'Confirm Password','password','Re-enter password')}

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: 13, fontSize: 15, marginTop: 8 }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#5A6480' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#00B4FF', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
