import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function LeakMonitor() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState('');

  const checkBreach = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setHasSearched(true);
      setSearchedEmail(email);
    }, 1500);
  };

  const isPruthvi = searchedEmail.toLowerCase() === 'pruthvishetty04@gmail.com';

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#09090b', // very dark grey, almost black
      color: '#ededed',
      fontFamily: 'Inter, -apple-system, sans-serif',
      paddingBottom: '100px'
    }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px', textAlign: 'center', marginBottom: '24px' }}>LEAK MONITOR</h1>

        {/* Search Bar Section */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
          <form onSubmit={checkBreach} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="@gmail.com"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '16px 16px 16px 48px',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#EF4444',
                color: '#fff',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Searching...' : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Search free
                </>
              )}
            </button>
          </form>
        </div>

        {hasSearched && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #EF4444', paddingBottom: '16px', marginBottom: '24px' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                  Results for <strong style={{ color: '#fff' }}>{searchedEmail}</strong>
                </span>
                <button onClick={() => { setHasSearched(false); setEmail(''); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>
                  New lookup
                </button>
              </div>

              {/* AI Profile Summary */}
              <div style={{ background: 'linear-gradient(180deg, rgba(239,68,68,0.1) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>AI Profile Summary</h3>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Synthesized across all sources for <strong>{searchedEmail}</strong></span>
                    </div>
                  </div>
                  <div style={{ border: '1px solid #10B981', color: '#10B981', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Low risk
                  </div>
                </div>

                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500' }}>
                  {isPruthvi ? 'Multiple Online Accounts Identified for Pruthvi Shetty' : 'Online Presence Summary'}
                </h4>

                <ul style={{ margin: '0 0 24px 0', paddingLeft: '24px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>
                  {isPruthvi ? (
                    <>
                      <li style={{ color: '#EF4444' }}><span style={{ color: '#ededed' }}>Accounts found on Chess.com, Google, Strava, Adobe, GitHub, LinkedIn, and Instagram.</span></li>
                      <li style={{ color: '#EF4444' }}><span style={{ color: '#ededed' }}>LinkedIn profile indicates roles as a Computer Science Student and Full Stack Engineer.</span></li>
                      <li style={{ color: '#EF4444' }}><span style={{ color: '#ededed' }}>Recent activity on Chess.com (October 2024) and Strava (January 2024).</span></li>
                      <li style={{ color: '#EF4444' }}><span style={{ color: '#ededed' }}>No associated data breaches or stealer log entries were found in the digest.</span></li>
                    </>
                  ) : (
                    <>
                      <li style={{ color: '#EF4444' }}><span style={{ color: '#ededed' }}>No associated data breaches or stealer log entries were found.</span></li>
                      <li style={{ color: '#EF4444' }}><span style={{ color: '#ededed' }}>Limited public profile information available for this address.</span></li>
                    </>
                  )}
                </ul>

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  <strong style={{ color: '#10B981' }}>Risk note</strong> &middot; {isPruthvi ? "The subject has multiple online accounts across various platforms. However, no data breaches or stealer log entries were identified in the provided digest, indicating a low risk of compromise based on this data." : "No significant risk indicators found. Keep monitoring regularly."}
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {[{ label: 'Accounts found', val: isPruthvi ? '12' : '0' }, { label: 'First seen', val: isPruthvi ? 'Sep 11, 2024' : 'N/A' }, { label: 'Last seen', val: isPruthvi ? 'Jul 18, 2026' : 'N/A' }].map((stat, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px' }}>{stat.label}</div>
                    <div style={{ fontSize: '20px', fontWeight: '600' }}>{stat.val}</div>
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '40px' }}>
                
                {/* Names Found */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Names Found
                  </div>
                  {isPruthvi ? (
                    <div style={{ fontSize: '14px' }}><strong>Pruthvi Shetty</strong> <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Google</span></div>
                  ) : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>None</div>}
                </div>

                {/* Usernames */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>
                    Usernames
                  </div>
                  {isPruthvi ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}><strong>pruthvishetty04</strong> <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Chess.com</span></div>
                      <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}><strong>pruthvi0412</strong> <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>GitHub</span></div>
                      <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}><strong>pruthvi-shetty-0b78942a7</strong> <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>LinkedIn</span></div>
                    </div>
                  ) : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>None</div>}
                </div>

                {/* Phone Numbers */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    Phone Numbers
                  </div>
                  {isPruthvi ? (
                    <div style={{ fontSize: '14px' }}><strong>****** ***69</strong> <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Apple</span></div>
                  ) : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>None</div>}
                </div>

                {/* Profile Pictures */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Profile Pictures
                  </div>
                  {isPruthvi ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                      ))}
                    </div>
                  ) : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>None</div>}
                </div>

                {/* Profile Links */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    Profile Links
                  </div>
                  {isPruthvi ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div><span style={{ color: '#EF4444' }}>pruthvishetty04</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>(Chess.com)</span></div>
                      <div><span style={{ color: '#EF4444' }}>Google</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>(Google)</span></div>
                      <div><span style={{ color: '#EF4444' }}>Strava</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>(Strava)</span></div>
                      <div><span style={{ color: '#EF4444' }}>pruthvi0412</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>(GitHub)</span></div>
                      <div><span style={{ color: '#EF4444' }}>pruthvi-shetty-0b78942a7</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>(LinkedIn)</span></div>
                    </div>
                  ) : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>None</div>}
                </div>

                {/* Locations */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Locations
                  </div>
                  {isPruthvi ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> <strong>India</strong> <span style={{ color: 'rgba(255,255,255,0.4)' }}>Chess.com</span></div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> 
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Shop No G9, Hotel Central Park, Manipal, Lakshmindra Nagar, Udupi, Karnataka 576104, India</div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Google</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> <span style={{ color: 'rgba(255,255,255,0.8)' }}>Bengaluru, Karnataka, India</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>Strava</span></div>
                      <div style={{ display: 'flex', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> <span style={{ color: 'rgba(255,255,255,0.8)' }}>Udupi, Karnataka, India</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>LinkedIn</span></div>
                    </div>
                  ) : <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>None</div>}
                </div>

              </div>

              {/* Activity Timeline */}
              {isPruthvi && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Activity Timeline
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {[
                      { date: 'Jul 18, 2026', desc: 'Last Seen Date · Google' },
                      { date: 'Oct 7, 2024', desc: 'Last Login Date · Chess.com' },
                      { date: 'Sep 11, 2024', desc: 'Creation Date · Chess.com' },
                      { date: 'Jan 29, 2024', desc: 'Created At · Strava' },
                    ].map((act, i) => (
                      <div key={i} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px' }}>
                        <strong>{act.date}</strong> <span style={{ color: 'rgba(255,255,255,0.4)' }}>{act.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Accounts */}
              {isPruthvi && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Linked accounts</h3>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '16px' }}>8 profiles discovered</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    
                    {/* Adobe */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <strong style={{ color: '#fff' }}>A</strong>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>Adobe</div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>adobe.com</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        <div><div style={{ marginBottom: '4px' }}>ACCOUNT TYPE</div><div style={{ color: '#fff', fontSize: '13px' }}>individual</div></div>
                        <div><div style={{ marginBottom: '4px' }}>STATUS</div><div style={{ color: '#fff', fontSize: '13px' }}>active</div></div>
                        <div><div style={{ marginBottom: '4px' }}>HAS T2E LINKED</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px' }}>No</div></div>
                        <div><div style={{ marginBottom: '4px' }}>AUTHENTICATION METHODS</div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>otp</span>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>google</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Apple */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <strong style={{ color: '#fff' }}>A</strong>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>Apple</div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>apple.com</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        <div><div style={{ marginBottom: '4px' }}>MULTIPLE EMAILS</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px' }}>No</div></div>
                        <div><div style={{ marginBottom: '4px' }}>PHONE NUMBERS</div><div style={{ color: '#fff', fontSize: '13px' }}>****** ***69</div></div>
                      </div>
                    </div>

                    {/* Chess.com */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M15 19v2H9v-2h6zM12 2l2.5 4.5h-5L12 2zm3.5 5.5l1.5 5.5h-10l1.5-5.5h7zM16 14v4H8v-4h8z"/></svg>
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Chess.com</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>pruthvishetty04</div>
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        <div><div style={{ marginBottom: '4px' }}>PREMIUM STATUS</div><div style={{ color: '#fff', fontSize: '13px' }}>0</div></div>
                        <div><div style={{ marginBottom: '4px' }}>LAST LOGIN DATE</div><div style={{ color: '#fff', fontSize: '13px' }}>Oct 7, 2024</div></div>
                        <div><div style={{ marginBottom: '4px' }}>IS ONLINE</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px' }}>No</div></div>
                        <div><div style={{ marginBottom: '4px' }}>USER ID</div><div style={{ color: '#fff', fontSize: '13px' }}>387,590,593</div></div>
                        <div><div style={{ marginBottom: '4px' }}>COUNTRY</div><div style={{ color: '#fff', fontSize: '13px' }}>India</div></div>
                        <div><div style={{ marginBottom: '4px' }}>CREATION DATE</div><div style={{ color: '#fff', fontSize: '13px' }}>Sep 11, 2024</div></div>
                      </div>
                    </div>

                    {/* GitHub */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>GitHub</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>pruthvi0412</div>
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        <div><div style={{ marginBottom: '4px' }}>ID</div><div style={{ color: '#fff', fontSize: '13px' }}>169247422</div></div>
                      </div>
                    </div>

                    {/* Instagram */}
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid #EF4444', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <strong style={{ color: '#fff' }}>I</strong>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>Instagram</div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>instagram.com</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        <div><div style={{ marginBottom: '4px' }}>SEARCH TYPE</div><div style={{ color: '#fff', fontSize: '13px' }}>EMAIL</div></div>
                        <div><div style={{ marginBottom: '4px' }}>ACCOUNT TYPE</div><div style={{ color: '#fff', fontSize: '13px' }}>PRE_META</div></div>
                        <div><div style={{ marginBottom: '4px' }}>FETA ACCOUNT RETURNED</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px' }}>No</div></div>
                        <div><div style={{ marginBottom: '4px' }}>ALLOW DISPLAY</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px' }}>No</div></div>
                        <div><div style={{ marginBottom: '4px' }}>RECOVERY EMAILS</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>pruthvishetty04@g...</div></div>
                        <div><div style={{ marginBottom: '4px' }}>ELIGIBLE FOR AR CODE</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px' }}>No</div></div>
                      </div>
                    </div>

                    {/* Google Full Width Card */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '0', gridColumn: '1 / -1' }}>
                      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px' }}>Google</div>
                              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Pruthvi Shetty</div>
                            </div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                          <div><div style={{ marginBottom: '4px' }}>ID</div><div style={{ color: '#fff', fontSize: '13px' }}>109469787909334246032</div></div>
                          <div><div style={{ marginBottom: '4px' }}>ENTERPRISE USER</div><div style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '10px' }}>No</div></div>
                          <div><div style={{ marginBottom: '4px' }}>LAST SEEN DATE</div><div style={{ color: '#fff', fontSize: '13px' }}>Jul 18, 2026</div></div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                          <div style={{ marginBottom: '8px' }}>ACTIVE GOOGLE APPS</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', color: '#fff' }}>Photos</span>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', color: '#fff' }}>Kaboo</span>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', color: '#fff' }}>Maps</span>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', color: '#fff' }}>Meet</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '16px' }}>
                          <div>GOOGLE REVIEWS</div>
                          <div>1 item</div>
                        </div>
                        <div style={{ fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#fff' }}>PUMA Store</strong>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            Shop No G9, Hotel Central Park, Manipal, Lakshmindra Nagar, Udupi, Karnataka 576104, India
                          </div>
                          <div style={{ color: '#fff', marginBottom: '16px' }}>en</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <span>11 months ago</span>
                              <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> 13.3483, 74.7829</span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <span style={{ color: '#EF4444', display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>Open in Maps <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
                              <span style={{ color: '#EF4444', display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer' }}>Source <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '16px' }}>
                          <div>GOOGLE PHOTOS</div>
                          <div>1 item</div>
                        </div>
                        <div style={{ height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                           <img src="https://images.unsplash.com/photo-1590845947698-8924d7409b56?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Shopping bags" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
              
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
