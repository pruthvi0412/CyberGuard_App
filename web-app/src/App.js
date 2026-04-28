import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './hooks/useAuthStore';
import { connectSocket } from './services/socket';

// Pages
import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import TrackComplaint  from './pages/TrackComplaint';
import AdminDashboard  from './pages/AdminDashboard';

// Components
import CyberReport     from './components/CyberReport'; 

export default function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) connectSocket(user.id, user.role === 'admin');
  }, [user]);

  return (
    <BrowserRouter>
      {/* Global CSS Reset for the Brutalist Hybrid Look */}
      <style>
        {`
          body { 
            background-color: #0A0F1E !important; 
            margin: 0; 
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { 
            background: '#0C1428', 
            color: '#E0E8FF', 
            border: '1px solid rgba(0,180,255,0.3)',
            borderRadius: '0px' 
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/submit" element={<CyberReport />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}