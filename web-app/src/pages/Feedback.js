import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Feedback() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNo: '',
    state: '',
    ackNo: '',
    email: '',
    wishList: '',
    feedback: '',
    errorScreenshot: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not be more than 5 MB", {
          style: { background: 'rgba(255, 59, 48, 0.2)', color: '#FF3B30', border: '1px solid rgba(255, 59, 48, 0.5)' }
        });
        return;
      }
      setFormData(prev => ({ ...prev, errorScreenshot: file }));
    }
  };

  const handleGetOTP = () => {
    if (!formData.firstName || !formData.mobileNo || !formData.state || !formData.wishList || !formData.feedback) {
      toast.error('Please fill all required fields', {
        style: { background: 'rgba(255, 59, 48, 0.2)', color: '#FF3B30', border: '1px solid rgba(255, 59, 48, 0.5)' }
      });
      return;
    }
    toast.success('OTP sent to your mobile number!', {
      style: { background: 'rgba(0, 255, 170, 0.2)', color: '#00FFD1', border: '1px solid rgba(0, 255, 170, 0.5)' }
    });
  };

  return (
    <div style={{
      background: '#02060A',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Liquid Atmospheric Accents */}
      <div style={{ position: 'fixed', top: '10%', right: '-20%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.08) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(0, 255, 170, 0.05) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <main style={{ 
        maxWidth: '900px', 
        margin: '60px auto', 
        padding: '0 20px',
        position: 'relative', 
        zIndex: 1 
      }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 800,
            fontFamily: 'Orbitron, monospace',
            background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px 0',
            letterSpacing: '-1px'
          }}>
            Feedback & <span style={{ color: '#00B4FF' }}>Support</span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            padding: '40px'
          }}
        >
          <p style={{ fontSize: '13px', marginBottom: '30px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', textAlign: 'justify' }}>
            We are happy to get back to you and help in solving issues you may have faced while browsing and/or participating through National Cyber Crime Reporting Portal.
            <br /><br />
            Did not find your suggestions on the platform? Do not hesitate to get in touch with us. We will try to address your issue at the earliest as we value your participation in the National Cyber Crime Reporting Portal.
            <br /><br />
            For details you can visit the <span style={{ color: '#00B4FF', cursor: 'pointer', fontWeight: 600 }}>FAQs page</span>.
          </p>

          <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', letterSpacing: '0.5px' }}>
              Required fields are marked with an asterisk (<span style={{color: '#FF3B30'}}>*</span>)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>First Name <span style={{color:'#FF3B30'}}>*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Mobile No <span style={{color:'#FF3B30'}}>*</span></label>
                <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange} placeholder="Enter mobile no." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>State / UT <span style={{color:'#FF3B30'}}>*</span></label>
                <select name="state" value={formData.state} onChange={handleChange} style={inputStyle}>
                  <option value="" style={{ color: '#000' }}>Select</option>
                  <option value="Karnataka" style={{ color: '#000' }}>Karnataka</option>
                  <option value="Maharashtra" style={{ color: '#000' }}>Maharashtra</option>
                  <option value="Delhi" style={{ color: '#000' }}>Delhi</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Acknowledgement Number (If Any)</label>
                <input type="text" name="ackNo" value={formData.ackNo} onChange={handleChange} placeholder="Enter Acknowledgement No." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Upload Error Screen Shot</label>
                <div style={{ display: 'flex' }}>
                  <label style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px 16px',
                    borderRight: 'none',
                    borderRadius: '12px 0 0 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#00B4FF',
                    fontWeight: 600,
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    CHOOSE FILE
                    <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                  <div style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '12px 16px',
                    flex: 1,
                    borderRadius: '0 12px 12px 0',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {formData.errorScreenshot ? formData.errorScreenshot.name : 'No file selected'}
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255, 59, 48, 0.8)', marginTop: '6px' }}>(File size should not more than 5 MB)</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Email id</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email id" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Wish List <span style={{color:'#FF3B30'}}>*</span></label>
                <select name="wishList" value={formData.wishList} onChange={handleChange} style={inputStyle}>
                  <option value="" style={{ color: '#000' }}>Select</option>
                  <option value="Feature Request" style={{ color: '#000' }}>Feature Request</option>
                  <option value="Bug Report" style={{ color: '#000' }}>Bug Report</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Feedback <span style={{color:'#FF3B30'}}>*</span></label>
              <textarea 
                name="feedback" 
                value={formData.feedback} 
                onChange={(e) => e.target.value.length <= 500 && handleChange(e)} 
                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>(Feedback should not be greater than 500 characters)</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Maximum 500 chars - <span style={{color:'#FF3B30', fontWeight: 'bold'}}>{500 - formData.feedback.length}</span> left</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <button onClick={handleGetOTP} style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #00B4FF 100%)', 
                color: '#fff', border: 'none', 
                padding: '0 40px', height: '46px', borderRadius: '12px', 
                fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                letterSpacing: '1px', transition: 'all 0.3s',
                boxShadow: '0 10px 20px rgba(0, 180, 255, 0.2)'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                GET OTP
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

const labelStyle = {
  display: 'block', 
  fontSize: '11px', 
  color: 'rgba(255,255,255,0.5)', 
  marginBottom: '8px', 
  fontWeight: '600', 
  textTransform: 'uppercase', 
  letterSpacing: '1px'
};

const inputStyle = {
  width: '100%', 
  padding: '12px 16px', 
  background: 'rgba(0, 0, 0, 0.3)', 
  border: '1px solid rgba(255, 255, 255, 0.1)', 
  borderRadius: '12px', 
  fontSize: '14px', 
  color: '#fff',
  outline: 'none', 
  boxSizing: 'border-box', 
  transition: 'all 0.3s'
};
