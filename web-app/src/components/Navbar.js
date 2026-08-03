import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';
import useTranslationStore from '../hooks/useTranslationStore';
import { getAvatarUrl } from '../utils/avatar';
import NotificationCenter from './NotificationCenter';
import DeveloperAccessScanner from './DeveloperAccessScanner';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isOfficer } = useAuthStore();
  const { t } = useTranslationStore();
  const containerRef = useRef(null);
  const helpBtnRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);

            {/* USER role navigation */}
            {!isAdmin() && !isOfficer() && (
              <>
                {navLink('/dashboard', 'MY COMPLAINTS', 'PERSONAL')}
                {navLink('/community', 'COMMUNITY', 'BROWSE')}
                {navLink('/submit', 'REPORT', 'ACTION')}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/scam-search', 'SCAM SEARCH', 'INTEL')}
                {navLink('/forensic-scanner', 'NEURAL SCAN', 'INTEL')}
                {navLink('/leak-monitor', 'LEAK MONITOR', 'INTEL')}
                {navLink('/threat-map', 'HOTSPOTS', 'INTEL')}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/chat', 'COMMS', 'NETWORK')}
              </>
            )}

            {/* OFFICER role navigation */}
            {isOfficer() && (
              <>

            {/* USER role navigation */}
            {!isAdmin() && !isOfficer() && (
              <>
                {navLink('/dashboard', t('NAVBAR.COMPLAINTS', 'MY COMPLAINTS'), t('NAVBAR.PERSONAL', 'PERSONAL'))}
                {navLink('/community', t('NAVBAR.COMMUNITY', 'COMMUNITY'), t('NAVBAR.BROWSE', 'BROWSE'))}
                {navLink('/submit', t('NAVBAR.REPORT', 'REPORT'), t('NAVBAR.ACTION', 'ACTION'))}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/scam-search', t('NAVBAR.SCAM_SEARCH', 'SCAM SEARCH'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/suspect-search', t('NAVBAR.SUSPECT_SEARCH', 'SUSPECT SEARCH'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/forensic-scanner', t('NAVBAR.NEURAL_SCAN', 'NEURAL SCAN'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/leak-monitor', t('NAVBAR.LEAK_MONITOR', 'LEAK MONITOR'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/threat-map', t('NAVBAR.HOTSPOTS', 'HOTSPOTS'), t('NAVBAR.INTEL', 'INTEL'))}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/chat', t('NAVBAR.COMMS', 'COMMS'), t('NAVBAR.NETWORK', 'NETWORK'))}
                {navLink('/learn', t('NAVBAR.LEARN', 'LEARN'), t('NAVBAR.AWARENESS', 'AWARENESS'))}
              </>
            )}

            {/* OFFICER role navigation */}
            {isOfficer() && (
              <>
                {navLink('/dashboard', t('NAVBAR.COMPLAINTS', 'COMPLAINTS'), t('NAVBAR.CORE', 'CORE'))}
                {navLink('/submit', t('NAVBAR.REPORT', 'REPORT'), t('NAVBAR.ACTION', 'ACTION'))}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/admin', t('NAVBAR.COMMAND_CENTER', 'COMMAND CENTER'), t('NAVBAR.OFFICER', 'OFFICER'))}
                {navLink('/admin/safety', t('NAVBAR.SAFETY', 'SAFETY'), t('NAVBAR.OFFICER', 'OFFICER'))}
                {navLink('/admin/database', t('NAVBAR.DATABASE', 'DATABASE'), t('NAVBAR.OFFICER', 'OFFICER'))}
                {navLink('/admin/link-analysis', t('NAVBAR.FORENSICS', 'FORENSICS'), t('NAVBAR.OFFICER', 'OFFICER'))}
                {navLink('/admin/map', t('NAVBAR.MAP', 'MAP'), t('NAVBAR.OFFICER', 'OFFICER'))}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/scam-search', t('NAVBAR.SCAM_SEARCH', 'SCAM SEARCH'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/suspect-search', t('NAVBAR.SUSPECT_SEARCH', 'SUSPECT SEARCH'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/forensic-scanner', t('NAVBAR.NEURAL_SCAN', 'NEURAL SCAN'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/chat', t('NAVBAR.COMMS', 'COMMS'), t('NAVBAR.NETWORK', 'NETWORK'))}
                {navLink('/learn', t('NAVBAR.LEARN', 'LEARN'), t('NAVBAR.AWARENESS', 'AWARENESS'))}
              </>
            )}

            {/* ADMIN role navigation */}
            {isAdmin() && (
              <>
                {navLink('/dashboard', t('NAVBAR.ALL_COMPLAINTS', 'ALL COMPLAINTS'), t('NAVBAR.ADMIN', 'ADMIN'))}
                {navLink('/submit', t('NAVBAR.REPORT', 'REPORT'), t('NAVBAR.ACTION', 'ACTION'))}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/admin', t('NAVBAR.COMMAND_CENTER', 'COMMAND CENTER'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                {navLink('/admin/users', t('NAVBAR.ACCOUNTS', 'ACCOUNTS'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                {navLink('/admin/mails', t('NAVBAR.MAIL', 'MAIL'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                {navLink('/admin/database', t('NAVBAR.DATABASE', 'DATABASE'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                {navLink('/admin/link-analysis', t('NAVBAR.FORENSICS', 'FORENSICS'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                {navLink('/admin/map', t('NAVBAR.MAP', 'MAP'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                {navLink('/admin/info', t('NAVBAR.INFO', 'INFO'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                {navLink('/admin/safety', t('NAVBAR.SAFETY', 'SAFETY'), t('NAVBAR.SYSTEM', 'SYSTEM'))}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                {navLink('/scam-search', t('NAVBAR.SCAM_SEARCH', 'SCAM SEARCH'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/suspect-search', t('NAVBAR.SUSPECT_SEARCH', 'SUSPECT SEARCH'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/forensic-scanner', t('NAVBAR.NEURAL_SCAN', 'NEURAL SCAN'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/leak-monitor', t('NAVBAR.LEAK_MONITOR', 'LEAK MONITOR'), t('NAVBAR.INTEL', 'INTEL'))}
                {navLink('/chat', t('NAVBAR.COMMS', 'COMMS'), t('NAVBAR.NETWORK', 'NETWORK'))}
                {navLink('/learn', t('NAVBAR.LEARN', 'LEARN'), t('NAVBAR.AWARENESS', 'AWARENESS'))}
              </>
            )}

            <div
              ref={helpBtnRef}
              onClick={toggleHelpMenu}
              style={{
                color: showHelpMenu ? '#00B4FF' : '#8892B0',
                textDecoration: 'none', 
                fontSize: 11, 
                fontWeight: 700,
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
                padding: '10px 20px',
                borderRadius: '8px',
                background: showHelpMenu ? 'rgba(0,180,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: showHelpMenu ? '1px solid rgba(0,180,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: 'fit-content',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '8px', opacity: 0.6, color: '#00B4FF', textTransform: 'uppercase' }}>SUPPORT</span>
              HELP & FAQ
            </div>

            {showHelpMenu && createPortal(
                <div style={{
                  position: 'fixed',
                  top: helpMenuPos.top + 'px',
                  left: helpMenuPos.left + 'px',
                  transform: 'translateX(-50%)',
                  background: 'rgba(3, 10, 15, 0.98)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(0, 180, 255, 0.25)',
                  borderRadius: '12px',
                  padding: '10px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '150px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  zIndex: 99999
                }}>
                  <div
                    onClick={() => {
                      setShowHelpMenu(false);
                      window.open('/contactlist.pdf', '_blank');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(0,180,255,0.1)';
                      e.target.style.color = '#00B4FF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#fff';
                    }}
                    style={{ padding: '10px 20px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s', textAlign: 'center', fontFamily: 'Orbitron, monospace' }}
                  >
                    Contact Us
                  </div>
                  <div
                    onClick={() => {
                      setShowHelpMenu(false);
                      navigate('/feedback');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(0,180,255,0.1)';
                      e.target.style.color = '#00B4FF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#fff';
                    }}
                    style={{ padding: '10px 20px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s', textAlign: 'center', fontFamily: 'Orbitron, monospace' }}
                  >
                    Feedback
                  </div>
                  <div
                    onClick={() => {
                      setShowHelpMenu(false);
                      navigate('/faq');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(0,180,255,0.1)';
                      e.target.style.color = '#00B4FF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#fff';
                    }}
                    style={{ padding: '10px 20px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s', textAlign: 'center', fontFamily: 'Orbitron, monospace' }}
                  >
                    FAQ
                  </div>
                </div>,
                document.body
              )}
          </div>
        </div>

        {/* Right Arrow */}
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,180,255,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scroll('right')}
          style={{
            background: 'rgba(3,10,15,0.8)', border: '1px solid rgba(0,180,255,0.3)',
            borderRadius: '8px', width: 32, height: 48, color: '#00B4FF', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, position: 'absolute', right: 0, fontSize: 18, boxShadow: '0 0 20px rgba(0,0,0,0.5)'
          }}
        >
          ❯
        </motion.button>
      </div>

      {/* Right Controls Dock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, marginLeft: 'auto' }}>
        <motion.div 
          whileHover={{ rotate: 90, scale: 1.1, color: '#00B4FF' }}
          onClick={() => navigate('/settings')}
          style={{ 
            cursor: 'pointer', padding: '10px', borderRadius: '10px', color: '#8892B0',
            background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s'
          }}
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </motion.div>

        <NotificationCenter />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
          
          {/* User Identity Display */}
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', marginRight: '5px' }}>
              <span style={{ color: '#E2E8F0', fontSize: '13px', fontWeight: '500', letterSpacing: '0.5px' }}>
                {user.name || user.email}
              </span>
              <span style={{
                marginTop: '4px',
                fontSize: '9px',
                fontWeight: '900',
                fontFamily: 'Orbitron, monospace',
                letterSpacing: '1.5px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: user.role === 'admin' ? 'rgba(255,82,82,0.15)' : user.role === 'officer' ? 'rgba(255,167,38,0.15)' : 'rgba(0,180,255,0.15)',
                color: user.role === 'admin' ? '#FF5252' : user.role === 'officer' ? '#FFA726' : '#00B4FF',
                border: `1px solid ${user.role === 'admin' ? 'rgba(255,82,82,0.4)' : user.role === 'officer' ? 'rgba(255,167,38,0.4)' : 'rgba(0,180,255,0.4)'}`
              }}>
                {user.role ? user.role.toUpperCase() : 'USER'}
              </span>
            </div>
          )}

          <div 
            onClick={() => navigate('/settings')}
            style={{ 
              width: 42, height: 42, borderRadius: '50%', 
              border: '2px solid #00B4FF',
              padding: '2px',
              overflow: 'hidden', cursor: 'pointer',
              background: 'rgba(0,180,255,0.1)',
              boxShadow: '0 0 10px rgba(0,180,255,0.2)'
            }}
          >
            {user?.avatar ? (
              <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5002${user.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00B4FF', fontSize: 18, fontWeight: 'bold' }}>
                {user?.name?.[0]}
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setShowLogoutConfirm(true)} 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,82,82,0.15), rgba(255,82,82,0.05))',
            border: '1px solid rgba(255,82,82,0.4)',
            color: '#FF5252',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            transition: '0.3s',
            letterSpacing: '1px',
            whiteSpace: 'nowrap'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,82,82,0.2)';
            e.target.style.borderColor = 'rgba(255,82,82,0.8)';
            e.target.style.boxShadow = '0 0 15px rgba(255,82,82,0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,82,82,0.15)';
            e.target.style.borderColor = 'rgba(255,82,82,0.4)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {t('NAVBAR.LOGOUT', 'DISCONNECT')}
        </button>
      </div>

      <style>{`
        ::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        .nav-link:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,180,255,0.2); }
      `}</style>
    </nav>
    </>
  );
}
