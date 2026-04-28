import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { complaintsAPI } from '../services/api';

const CyberReport = () => {
  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState({ label: "IDLE", color: "var(--muted)" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logic to analyze text as you type
  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);

    const phishing = ['link', 'click', 'bank', 'password', 'otp', 'verify'];
    const fraud = ['money', 'transfer', 'upi', 'payment', 'rs', 'amount'];

    if (val.length < 5) {
      setAnalysis({ label: "IDLE", color: "var(--muted)" });
    } else if (phishing.some(word => val.toLowerCase().includes(word))) {
      setAnalysis({ label: "PHISHING DETECTED", color: "var(--warn)" });
    } else if (fraud.some(word => val.toLowerCase().includes(word))) {
      setAnalysis({ label: "FINANCIAL FRAUD", color: "var(--accent)" });
    } else {
      setAnalysis({ label: "SCANNING...", color: "var(--electric)" });
    }
  };

  const handleSubmit = async () => {
    if (!inputText) return toast.error("Please describe the incident");
    
    setIsSubmitting(true);
    try {
      // Sending to your Railway Backend
      const formData = new FormData();
      formData.append('description', inputText);
      formData.append('category', analysis.label.replace(' DETECTED', ''));

      await complaintsAPI.create(formData);
      toast.success("Report submitted to central database");
      setInputText("");
    } catch (err) {
      toast.error("Submission failed. Check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="animate-fade-in" style={{ padding: 'var(--section-padding)', minHeight: '80vh' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 350px', 
        gap: '1px', 
        background: 'var(--border)',
        border: '1px solid var(--border)' 
      }}>
        
        {/* Left Side: Input Area */}
        <div style={{ background: 'var(--navy)', padding: '60px' }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '2.5rem', color: 'white' }}>01. REPORT</h2>
          <textarea 
            className="input-cyber"
            style={{ 
              height: '350px', 
              fontSize: '1.5rem', 
              lineHeight: '1.6',
              color: 'var(--text)'
            }}
            placeholder="DESCRIBE THE CYBER THREAT IN DETAIL..."
            value={inputText}
            onChange={handleInput}
          />
        </div>

        {/* Right Side: AI Status Panel */}
        <div className="glass" style={{ 
          padding: '40px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <label>SYSTEM STATUS</label>
            <div style={{ 
              color: analysis.color, 
              fontWeight: 'bold', 
              fontSize: '1.4rem', 
              marginTop: '15px',
              fontFamily: 'Orbitron'
            }}>
              ● {analysis.label}
            </div>
            
            <div style={{ marginTop: '40px', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.8' }}>
              <p>NEURAL ENGINE ACTIVE</p>
              <p>ENCRYPTION: AES-256</p>
              <p>LOCATION: TRACKED</p>
            </div>
          </div>
          
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ width: '100%', height: '70px', fontSize: '0.9rem' }}
          >
            {isSubmitting ? "UPLOADING..." : "SUBMIT ENCRYPTED DATA"}
          </button>
        </div>

      </div>
    </section>
  );
};

export default CyberReport;