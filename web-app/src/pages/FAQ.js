import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  { question: "What is the purpose of National Cyber Crime Reporting Portal?", answer: "This portal is an initiative of the Government of India to facilitate victims/complainants to report cyber crime complaints online. This portal caters to complaints pertaining to cyber crimes only with special focus on cyber crimes against women and children." },
  { question: "What is CSEAM - Child Sexual Exploitative and Abuse Material?", answer: "CSEAM refers to any digital content that depicts the sexual exploitation or abuse of children. It is illegal to possess, distribute, or view such material." },
  { question: "Apart from this portal, are there any alternative ways to remove objectionable content from social media websites?", answer: "Yes, you can directly report the content to the respective social media platform using their in-built reporting mechanisms. Most platforms have strict policies against objectionable content." },
  { question: "Which type of cybercrimes I can report on the portal?", answer: "You can report all types of cybercrimes on this portal, including cyber fraud, identity theft, cyber bullying, cyber stalking, and crimes against women and children." },
  { question: "What kind of information, should I provide to report complaint?", answer: "Please provide complete details of the incident, supporting digital evidence (screenshots, bank statements, emails, URLs), and your contact information." },
  { question: "Which State/ UT shall I select while reporting a complaint?", answer: "Select the State/UT where you currently reside or where the incident occurred. If you are unsure, select your current state of residence." },
  { question: "How can I file the complaints about other cybercrimes?", answer: "You can use the 'Report Other Cybercrimes' section on the portal to file complaints for crimes not specifically listed under the Women and Children section." },
  { question: "What type of information would be considered as evidence while filing my complaint related to cybercrime?", answer: "Evidence can include screenshots, emails, chat transcripts, bank transaction receipts, URLs, and any other digital footprints left by the attacker." },
  { question: "What action will be taken if complainant reports any false complaint/information?", answer: "Filing a false complaint is a punishable offense under the law, and strict legal action will be taken against individuals providing false information." },
  { question: "Can I report a complaint without uploading any information?", answer: "While you can submit a complaint, providing evidence significantly helps law enforcement in the investigation process and increases the chances of resolution." },
  { question: "What happens once I report a complaint?", answer: "Your complaint is assigned to the respective police station/cyber cell for further investigation. You will receive an acknowledgment number for tracking." },
  { question: "Will I be informed that my complaint has been submitted successfully?", answer: "Yes, you will receive an acknowledgment number via SMS and email once your complaint is successfully submitted." },
  { question: "Can I check the status of my complaint?", answer: "Yes, you can track your complaint status using the acknowledgment number on the portal's tracking section." },
  { question: "Can I withdraw my complaint from the portal?", answer: "Withdrawal procedures depend on the jurisdiction and the stage of the investigation. You generally need to contact your local police station to request a withdrawal." },
  { question: "What is Hash value and what is its purpose?", answer: "A hash value is a unique digital fingerprint of a file. It helps ensure the integrity of digital evidence by proving the file has not been altered." },
  { question: "Can I file a complaint if I am an Indian citizen but have been victimized online/ in cyberspace by a foreign national or company?", answer: "Yes, you can file a complaint on the portal. The Indian cyber cell will coordinate with international agencies if necessary." },
  { question: "Can I file a complaint if I have been victimized online/ in cyberspace by an individual or company in India, but I am not a citizen of India?", answer: "Yes, you can report the incident on the portal regardless of your citizenship, provided the crime falls under Indian jurisdiction." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
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
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 122, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(0, 255, 170, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />
      
      <main style={{ 
        maxWidth: '1000px', 
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
            fontSize: '2.5rem', 
            fontWeight: 800,
            fontFamily: 'Orbitron, monospace',
            background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.5))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px 0',
            letterSpacing: '-1px'
          }}>
            FREQUENTLY ASKED <span style={{ color: '#00B4FF' }}>QUESTIONS</span>
          </h1>
        </motion.div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: isOpen ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(20px)',
                  border: isOpen ? '1px solid rgba(0, 180, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  boxShadow: isOpen ? '0 10px 30px rgba(0, 180, 255, 0.05)' : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}
              >
                <div 
                  onClick={() => toggleFAQ(index)}
                  style={{
                    padding: '24px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => !isOpen && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => !isOpen && (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ 
                    fontSize: '15px', 
                    color: isOpen ? '#00B4FF' : '#fff', 
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    lineHeight: '1.5'
                  }}>
                    {faq.question}
                  </span>
                  <span style={{ 
                    color: isOpen ? '#00B4FF' : 'rgba(255,255,255,0.3)', 
                    fontSize: '28px',
                    fontWeight: 300,
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'all 0.3s ease',
                    marginLeft: '20px'
                  }}>
                    +
                  </span>
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ 
                        padding: '0 30px 30px 30px', 
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '14px',
                        lineHeight: '1.8'
                      }}>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '24px' }} />
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
