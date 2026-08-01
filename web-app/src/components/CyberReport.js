import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { complaintsAPI } from '../services/api';

const CyberReport = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [files, setFiles] = useState([]);
  const [analysis, setAnalysis] = useState({ label: "IDLE", color: "var(--muted)" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pincode, setPincode] = useState("");
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");

  // 🔍 AI analysis on title + description
  useEffect(() => {
    const fullText = `${title} ${description}`;
    if (fullText.length < 15) {
      setAnalysis({ label: "IDLE", color: "var(--muted)" });
      return;
    }

    setAnalysis({ label: "SCANNING...", color: "var(--electric)" });

    const timer = setTimeout(async () => {
      try {
        const { data } = await complaintsAPI.analyze(fullText);
        if (data.status === 'success' && data.data) {
          const { category, confidence } = data.data;
          
          const labels = {
            'phishing': { l: 'PHISHING DETECTED', c: 'var(--warn)' },
            'financial_fraud': { l: 'FINANCIAL FRAUD', c: 'var(--accent)' },
            'cyberbullying': { l: 'CYBERBULLYING DETECTED', c: '#FF6B35' },
            'hacking': { l: 'HACKING ATTEMPT', c: '#9C27B0' },
            'ransomware': { l: 'RANSOMWARE ATTACK', c: 'var(--warn)' },
            'identity_theft': { l: 'IDENTITY THEFT', c: 'var(--accent)' },
            'online_fraud': { l: 'ONLINE FRAUD', c: 'var(--accent)' },
            'social_media_crime': { l: 'SOCIAL MEDIA CRIME', c: '#FF6B35' },
            'data_breach': { l: 'DATA BREACH', c: '#9C27B0' },
            'child_exploitation': { l: 'EXPLOITATION CASE', c: 'var(--warn)' }
          };

          const lowVal = fullText.toLowerCase();
          
          // Enhanced Keyword Boosters
          const isPhishing = /phishing|spoof|fake|credentials|password|login|verify|link|email/i.test(lowVal);
          const isHacking = /hack|exploit|vulnerability|unauthorized|root|admin|sql|injection|breach/i.test(lowVal);
          const isFraud = /upi|bank|money|fund|transfer|drain|atm|card|payment|fraud|financial/i.test(lowVal);
          const isBullying = /bully|harass|threat|abuse|hate|stalk/i.test(lowVal);

          let finalCategory = category;
          
          // Priority logic for boosters
          if (isFraud && !isHacking) finalCategory = 'financial_fraud';
          else if (isPhishing && confidence < 0.6) finalCategory = 'phishing';
          else if (isBullying && confidence < 0.4) finalCategory = 'cyberbullying';
          else if (isHacking && confidence < 0.3) finalCategory = 'hacking';

          const info = labels[finalCategory] || { l: finalCategory.replace(/_/g,' ').toUpperCase(), c: 'var(--electric)' };
          
          if (confidence > 0.05 || isPhishing || isHacking || isFraud || isBullying) {
            setAnalysis({ label: info.l, color: info.c });
          } else {
            setAnalysis({ label: "SCANNING SIGNATURES...", color: "var(--electric)" });
          }
        } else {
          setAnalysis({ label: "OFFLINE", color: "var(--muted)" });
        }
      } catch (err) {
        console.error("AI Analysis failed", err);
        setAnalysis({ label: "OFFLINE", color: "var(--muted)" });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [title, description]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
        toast.success("Live location captured!");
      },
      (error) => {
        console.error(error);
        setGettingLocation(false);
        toast.error("Failed to get location. Please enable location permissions.");
      }
    );
  };

  // 📁 File Upload handling
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5)); // Limit to 5 files
  }, []);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // We want the browse button to handle clicks
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/mp4': ['.mp4'],
      'text/plain': ['.txt']
    }
  });

  const handleSubmit = async () => {
    if (!title || title.length < 10) {
      return toast.error("Title must be at least 10 characters");
    }
    if (!description || description.length < 50) {
      return toast.error("Description must be at least 50 characters");
    }
    if (!incidentDate) {
      return toast.error("Please select incident date");
    }
    if (!pincode || pincode.length !== 6) {
      return toast.error("Please enter a valid 6-digit PIN code");
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('victimDetails', JSON.stringify({ 
        incidentDate,
        pincode,
        location: pincode, // Backup for basic location field
        email,
        countryCode,
        mobile
      }));
      
      if (location) {
        formData.append('location', JSON.stringify({
          type: 'Point',
          coordinates: [location.lng, location.lat]
        }));
      }
      
      // Append files
      files.forEach(file => {
        formData.append('evidence', file);
      });

      await complaintsAPI.create(formData);

      toast.success("Report submitted successfully 🚀");

      // Reset form
      setTitle("");
      setDescription("");
      setIncidentDate("");
      setPincode("");
      setLocation(null);
      setFiles([]);
      setAnalysis({ label: "IDLE", color: "var(--muted)" });

    } catch (err) {
      console.error(err.response?.data);
      const msg = err.response?.data?.message || "Submission failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '80px 24px', 
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Liquid Back Button */}
      <button 
        onClick={() => navigate('/')}
        style={{ 
          position: 'fixed',
          left: '40px',
          top: '40px',
          width: 50, height: 50, borderRadius: '50%', 
          background: 'rgba(255,255,255,0.05)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', 
          color: '#00B4FF', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      {/* Main Liquid Glass Container */}
      <div style={{ 
        width: '100%',
        background: 'rgba(10, 15, 30, 0.4)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '32px',
        padding: '60px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Accents */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0, 180, 255, 0.15) 0%, transparent 70%)', zIndex: -1 }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', zIndex: -1 }}></div>

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '3.2rem', 
            margin: '0 0 12px 0', 
            fontWeight: 800,
            background: 'linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0.5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Report Crime
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: 400 }}>Secure, encrypted incident reporting terminal</p>
        </div>

        <div style={{ display: 'grid', gap: '40px' }}>
          {/* TITLE & DATE GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', paddingLeft: '4px' }}>Incident Title</label>
              <input
                type="text"
                style={{ 
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
                className="liquid-input"
                placeholder="What happened?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', paddingLeft: '4px' }}>Incident Date</label>
              <input
                type="date"
                style={{ 
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  colorScheme: 'dark'
                }}
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', paddingLeft: '4px' }}>Detailed Narrative</label>
            <div style={{ position: 'relative' }}>
              <textarea
                style={{ 
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '20px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  height: '180px',
                  resize: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.6'
                }}
                placeholder="Provide as much detail as possible. Timestamps, names, links, or specific messages are crucial."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div style={{ 
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '11px',
                color: analysis.color,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: `1px solid ${analysis.color}33`,
                boxShadow: `0 4px 12px rgba(0,0,0,0.2)`
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: analysis.color, boxShadow: `0 0 12px ${analysis.color}` }}></span>
                AI ANALYZER: {analysis.label}
              </div>
            </div>
          </div>
          
          {/* LOCATION GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', paddingLeft: '4px' }}>Pin Code</label>
              <input
                type="text"
                style={{ 
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
                placeholder="6-digit ZIP"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', paddingLeft: '4px' }}>Geospatial Data</label>
              <div 
                onClick={handleGetLocation}
                style={{ 
                  background: location ? 'rgba(0, 180, 255, 0.1)' : 'rgba(255,255,255,0.03)', 
                  border: location ? '1px solid rgba(0, 180, 255, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: location ? '#00B4FF' : 'rgba(255,255,255,0.7)',
                  padding: '16px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  height: '54px',
                  boxShadow: location ? '0 0 20px rgba(0, 180, 255, 0.2)' : 'none'
                }}
                onMouseOver={e => e.currentTarget.style.background = location ? 'rgba(0, 180, 255, 0.15)' : 'rgba(255,255,255,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = location ? 'rgba(0, 180, 255, 0.1)' : 'rgba(255,255,255,0.03)'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {gettingLocation ? "ACQUIRING SIGNAL..." : location ? "POSITION LOCKED" : "TAG LIVE LOCATION"}
              </div>
            </div>
          </div>

          {/* CONTACT INFO GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', paddingLeft: '4px' }}>Email Address</label>
              <input
                type="email"
                style={{ 
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
                placeholder="victim@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', paddingLeft: '4px' }}>Mobile Number</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  style={{ 
                    width: '80px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                  placeholder="+91"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                />
                <input
                  type="text"
                  style={{ 
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          </div>

          {/* EVIDENCE SECTION */}
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px dashed rgba(255,255,255,0.1)', 
            borderRadius: '24px', 
            padding: '30px'
          }}>
            <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', display: 'block', textAlign: 'center' }}>Evidence & Documentation</label>
            
            <div 
              {...getRootProps()} 
              style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                borderRadius: '16px',
                border: isDragActive ? '1px solid #00B4FF' : 'none',
                background: isDragActive ? 'rgba(0,180,255,0.05)' : 'transparent',
                transition: '0.3s'
              }}
            >
              <input {...getInputProps()} />
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📂</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginBottom: '24px' }}>
                Drop visual evidence or legal documents here
              </p>
              <button 
                type="button"
                onClick={open}
                style={{ 
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: '0.3s',
                  boxShadow: '0 8px 16px rgba(255,255,255,0.1)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,255,255,0.2)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255,255,255,0.1)';
                }}
              >
                Choose Files
              </button>
            </div>

            {/* PREVIEWS */}
            {files.length > 0 && (
              <div style={{ marginTop: '25px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                {files.map((file, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '10px 16px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    fontSize: '13px',
                    color: '#fff',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8 }}>
                      {file.name}
                    </span>
                    <button 
                      onClick={() => removeFile(idx)}
                      style={{ background: 'rgba(255,59,48,0.1)', border: 'none', color: '#FF3B30', cursor: 'pointer', padding: '4px', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON - The Masterpiece */}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #00B4FF 0%, #A855F7 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '20px',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 15px 35px rgba(0, 180, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={e => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 180, 255, 0.5)';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 180, 255, 0.3)';
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  UPLOAD TO SECURE SERVER...
                </div>
              ) : "AUTHENTICATE & SUBMIT"}
              
              {/* Shine effect */}
              <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shine 3s infinite' }}></div>
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes shine { 0% { left: -100%; } 100% { left: 200%; } }
          
          .liquid-input:focus {
            background: rgba(255,255,255,0.06) !important;
            border-color: rgba(0, 180, 255, 0.5) !important;
            box-shadow: 0 0 0 4px rgba(0, 180, 255, 0.15), inset 0 2px 4px rgba(0,0,0,0.2) !important;
          }

          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.5;
            cursor: pointer;
          }
        `}
      </style>
    </section>
  );
};

export default CyberReport;