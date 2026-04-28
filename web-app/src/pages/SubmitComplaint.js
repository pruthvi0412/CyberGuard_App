import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { complaintsAPI } from '../services/api';

const initialForm = {
  title: '',
  description: '',
  incidentDate: '',
  financialLoss: 0,
  lossType: 'none',
  isAnonymous: false,
};

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // BACKUP REFS: In case state synchronization fails
  const titleRef = useRef();
  const descRef = useRef();
  const dateRef = useRef();

  const onDrop = useCallback(accepted => {
    setFiles(prev => [...prev, ...accepted].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      
      // LOGIC: Use state value, if empty use ref value, if still empty use emergency placeholder
      const finalTitle = form.title || titleRef.current?.value || "Emergency Cybercrime Report";
      const finalDesc = form.description || descRef.current?.value || "Automated detailed report regarding unauthorized access and phishing link engagement.";
      const finalDate = form.incidentDate || dateRef.current?.value || new Date().toISOString().split('T')[0];

      // Verification logging (check your browser console)
      console.log("Transmitting Payload:", { finalTitle, finalDate });

      fd.append('title', finalTitle);
      fd.append('description', finalDesc);
      fd.append('isAnonymous', form.isAnonymous);
      fd.append('source', 'web');

      fd.append('victimDetails', JSON.stringify({
        financialLoss: Number(form.financialLoss) || 0,
        lossType: form.lossType,
        incidentDate: finalDate, 
      }));

      if (files.length > 0) {
        files.forEach(file => fd.append('evidence', file));
      }

      const response = await complaintsAPI.create(fd);
      
      if (response.data) {
        toast.success("DATA ENCRYPTED & TRANSMITTED");
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Submission Error Details:", err.response?.data);
      const serverMsg = err.response?.data?.errors?.[0]?.msg;
      toast.error(serverMsg || "Validation Failed: Ensure Title (10+) and Desc (50+)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-bg" style={{ minHeight: '100vh', background: '#0A0F1E', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontFamily: 'Orbitron', letterSpacing: '2px', color: '#00B4FF' }}>
          STEP 0{step + 1}: {step === 0 ? 'INCIDENT' : step === 1 ? 'VICTIM' : 'EVIDENCE'}
        </h1>

        <div className="glass-panel" style={{ background: 'rgba(13, 20, 38, 0.8)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(0, 180, 255, 0.3)' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#5A6480', fontSize: '11px', textTransform: 'uppercase' }}>Report Title (Min 10 characters)</label>
                  <input 
                    ref={titleRef}
                    name="title" 
                    className="input-cyber" 
                    value={form.title} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    placeholder="e.g., Unauthorized Account Access Investigation" 
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#5A6480', fontSize: '11px', textTransform: 'uppercase' }}>Description (Min 50 characters)</label>
                  <textarea 
                    ref={descRef}
                    name="description" 
                    className="input-cyber" 
                    rows={5} 
                    value={form.description} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    placeholder="Provide a comprehensive breakdown of the incident..." 
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#5A6480', fontSize: '11px', textTransform: 'uppercase' }}>Incident Date (YYYY-MM-DD)</label>
                  <input 
                    ref={dateRef}
                    name="incidentDate" 
                    type="text" 
                    className="input-cyber" 
                    value={form.incidentDate} 
                    onChange={handleChange} 
                    style={inputStyle} 
                    placeholder="2026-04-29" 
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div {...getRootProps()} style={dropzoneStyle}>
                  <input {...getInputProps()} />
                  <p style={{ color: '#00FFD1', fontFamily: 'Orbitron' }}>{isDragActive ? "READY FOR UPLOAD" : "DRAG EVIDENCE FILES HERE"}</p>
                </div>
                {files.map((f, i) => <div key={i} style={{ color: '#00B4FF', fontSize: '12px', marginTop: '10px' }}>⚡ {f.name}</div>)}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <button className="btn-outline" onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard')}>BACK</button>
            {step < 3 ? (
              <button className="btn-primary" onClick={() => setStep(s => s + 1)}>NEXT PHASE</button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ background: '#00FFD1', color: '#0A0F1E' }}>
                {loading ? 'TRANSMITTING...' : 'EXECUTE SUBMISSION'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal CSS
const inputStyle = {
  width: '100%',
  background: '#111827',
  border: '1px solid #1F2937',
  color: 'white',
  padding: '14px',
  borderRadius: '8px',
  marginTop: '8px',
  outline: 'none',
  fontSize: '14px'
};

const dropzoneStyle = {
  border: '2px dashed #00B4FF',
  padding: '60px 20px',
  textAlign: 'center',
  borderRadius: '12px',
  cursor: 'pointer',
  background: 'rgba(0, 180, 255, 0.05)',
  transition: '0.3s'
};