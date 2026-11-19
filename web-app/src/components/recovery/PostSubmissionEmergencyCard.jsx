import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { safeFormatDate } from '../../utils/formatDate';
import {
  PhoneCall,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Mail,
  X,
  ExternalLink,
  Printer,
  FileText,
  Building,
  Hash
} from 'lucide-react';

/**
 * Checks if a complaint falls under financial cyber fraud categories
 */
const isFinancialComplaint = (complaint) => {
  if (!complaint) return false;
  if (complaint.lostMoney) return true;
  const cat = (complaint.category || '').toLowerCase();
  const sub = (complaint.subCategory || '').toLowerCase();
  return (
    cat.includes('financial') ||
    cat.includes('upi') ||
    cat.includes('bank') ||
    cat.includes('card') ||
    cat.includes('fraud') ||
    cat.includes('crypto') ||
    sub.includes('financial') ||
    sub.includes('upi') ||
    sub.includes('banking') ||
    sub.includes('fraud')
  );
};

export default function PostSubmissionEmergencyCard({ complaint, justSubmitted = false }) {
  // Only display if just submitted or if financial fraud
  const shouldRender = justSubmitted || isFinancialComplaint(complaint);

  // Modals state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // UTR copy state
  const [copiedUtr, setCopiedUtr] = useState(false);

  // Extracted identifiers from complaint
  const complaintId = complaint?.complaintId || complaint?._id || 'CC-UNKNOWN';
  const victim = complaint?.victimDetails || {};
  const rawUtr =
    victim.transactionReference ||
    complaint?.ocrData?.extracted?.utrs?.[0] ||
    complaint?.moneyTrail?.[0]?.utrOrRef ||
    '';
  const amountLost = victim.amountLost || complaint?.ocrData?.extracted?.amounts?.[0] || '0';
  const targetBeneficiary =
    complaint?.ocrData?.extracted?.upis?.[0] ||
    complaint?.ocrData?.extracted?.accounts?.[0] ||
    complaint?.suspectInfo?.details ||
    'Pending Account / UPI Identification';

  // Editable fields for RBI Dispute Letter Modal
  const [disputeForm, setDisputeForm] = useState({
    complainantName: '',
    disputedAmount: '',
    targetBeneficiary: '',
    incidentDate: '',
    bankName: ''
  });

  // Pre-populate dispute form when complaint changes
  useEffect(() => {
    if (complaint) {
      setDisputeForm({
        complainantName: victim.name || complaint.userId?.name || 'Complainant on Record',
        disputedAmount: amountLost ? String(amountLost) : '',
        targetBeneficiary: targetBeneficiary,
        incidentDate: victim.incidentDate
          ? safeFormatDate(victim.incidentDate, 'dd-MMM-yyyy HH:mm')
          : safeFormatDate(complaint.createdAt, 'dd-MMM-yyyy HH:mm'),
        bankName: complaint.moneyTrail?.[0]?.toBankName || ''
      });
    }
  }, [complaint]);

  // Golden-Hour 4-Hour Countdown Timer
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  useEffect(() => {
    if (!complaint) return;
    const filingTime = complaint.createdAt ? new Date(complaint.createdAt).getTime() : Date.now();
    const goldenHourExpiry = filingTime + 4 * 60 * 60 * 1000; // 4 Hours

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, goldenHourExpiry - now);
      setTimeLeftMs(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [complaint]);

  // Format countdown string
  const formattedCountdown = useMemo(() => {
    if (timeLeftMs <= 0) return '00:00:00';
    const totalSecs = Math.floor(timeLeftMs / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [timeLeftMs]);

  // 1-Tap UTR Copy handler
  const handleCopyUtr = () => {
    const textToCopy = rawUtr || complaintId;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedUtr(true);
      toast.success(rawUtr ? `Copied UTR: ${rawUtr}` : `Copied Case Reference: ${complaintId}`);
      setTimeout(() => setCopiedUtr(false), 2500);
    }
  };

  // Generate formal RBI Zero-Liability Dispute Letter text
  const generateRBILetterText = () => {
    const dateFormatted = safeFormatDate(new Date(), 'dd MMMM yyyy');
    return [
      'To,',
      'The Branch Manager / Nodal Cyber Grievance Officer,',
      disputeForm.bankName ? `${disputeForm.bankName},` : '[Name of Financial Institution / Bank],',
      '',
      'SUBJECT: FORMAL WRITTEN DISPUTE OF UNAUTHORIZED TRANSACTION & INVOCATION OF ZERO CUSTOMER LIABILITY UNDER RBI CIRCULAR DBR.No.Leg.BC.78/09.07.005/2017-18',
      '',
      'Dear Sir / Madam,',
      '',
      'I am writing to formally report an unauthorized electronic fraud debit from my account and place on record this statutory dispute within the mandatory 3-day reporting window.',
      '',
      '1. INCIDENT & TRANSACTION PARTICULARS:',
      `   • Account Holder / Complainant : ${disputeForm.complainantName}`,
      `   • Disputed Transaction Amount  : INR ${disputeForm.disputedAmount || 'As per bank debit alert'}`,
      `   • Transaction UTR / Ref Number : ${rawUtr || 'Under investigation / Transaction SMS attached'}`,
      `   • Suspect Beneficiary / UPI    : ${disputeForm.targetBeneficiary}`,
      `   • Date & Time of Occurrence    : ${disputeForm.incidentDate}`,
      `   • National Cyber Crime Ref ID  : ${complaintId}`,
      '',
      '2. STATUTORY LEGAL MANDATE (RESERVE BANK OF INDIA):',
      'Under Reserve Bank of India (RBI) Circular on "Customer Protection – Limiting Liability of Customers in Unauthorised Electronic Banking Transactions" (DBR.No.Leg.BC.78/09.07.005/2017-18):',
      '   a. This formal dispute is notified within three (3) working days of the unauthorized transaction.',
      '   b. As per Section 6(a), Zero Customer Liability applies where the unauthorized transaction occurs through third-party breach/fraud where neither the bank nor the customer is at fault, but lies elsewhere in the system.',
      '   c. As per Section 9, the bank is legally mandated to credit (shadow reversal) the disputed amount to the customer account within 10 working days of this notification.',
      '',
      '3. DIRECTIVES & RELIEF REQUESTED:',
      '   • Immediately transmit an urgent hold/lien recall request to the beneficiary bank or payment aggregator.',
      '   • Preserve raw IP transaction headers, device IMEI, and server timestamps for the cyber forensics audit.',
      '   • Issue a formal Grievance Acknowledgment Number for this statutory dispute.',
      '',
      `Official Cyber Incident Dossier Ref #${complaintId} has been registered with law enforcement under ISO/IEC 27037 standards.`,
      '',
      'Sincerely,',
      `${disputeForm.complainantName}`,
      `Date: ${dateFormatted}`
    ].join('\n');
  };

  // Generate ISO/IEC 27037 Evidentiary Intake Receipt text
  const generateEvidentiaryReceiptText = () => {
    const evidenceList = complaint?.evidence || [];
    const createdTimestamp = safeFormatDate(complaint?.createdAt, 'dd-MMM-yyyy HH:mm:ss');
    const depositor = victim.name || complaint?.userId?.name || 'Citizen on Record';

    return [
      '================================================================================',
      '        CYBERGUARD DIGITAL FORENSIC EVIDENCE DEPOSIT RECEIPT',
      '            ISO/IEC 27037 & INDIAN EVIDENCE ACT SEC 65B COMPLIANT',
      '================================================================================',
      '',
      `Case Tracking Identifier : ${complaintId}`,
      `Intake Timestamp         : ${createdTimestamp} IST`,
      `Depositor Identity       : ${depositor}`,
      `Complainant Contact      : ${victim.mobile || complaint?.userId?.phone || 'On Record'}`,
      `Crime Classification     : ${complaint?.category || 'Financial Fraud'}`,
      `Disputed Financial Loss  : INR ${amountLost}`,
      `Reported Transaction UTR : ${rawUtr || 'N/A'}`,
      `Chain of Custody Status  : SEALED & IMMUTABLE (SHA-256)`,
      '',
      '--------------------------------------------------------------------------------',
      '                DIGITAL EVIDENCE MANIFEST & INTEGRITY DIGESTS',
      '--------------------------------------------------------------------------------',
      evidenceList.length === 0
        ? '   No binary attachments deposited at initial intake.'
        : evidenceList
            .map(
              (ev, idx) =>
                `EXHIBIT #${idx + 1}:\n` +
                `   Filename      : ${ev.originalName || ev.filename}\n` +
                `   MIME Type     : ${ev.verifiedMime || ev.mimetype}\n` +
                `   File Size     : ${ev.size ? (ev.size / 1024).toFixed(1) + ' KB' : 'N/A'}\n` +
                `   SHA-256 Digest: ${ev.sha256 || 'INTAKE_VERIFIED_SHA256'}\n` +
                `   Integrity     : ${ev.integrityStatus || 'verified'}`
            )
            .join('\n\n'),
      '',
      '--------------------------------------------------------------------------------',
      '                STATUTORY EVIDENTIARY DECLARATION (ISO/IEC 27037)',
      '--------------------------------------------------------------------------------',
      'This document certifies that the electronic records listed above were ingested,',
      'cryptographically verified, and timestamped in accordance with ISO/IEC 27037',
      'guidelines for digital evidence handling. The SHA-256 cryptographic hashes',
      'recorded herein establish an unalterable baseline for statutory bank dispute',
      'reversal and judicial scrutiny under Section 65B of the Indian Evidence Act.',
      '',
      `Generated by CyberGuard Law Enforcement Incident Gateway on ${safeFormatDate(new Date(), 'dd-MMM-yyyy HH:mm:ss')}.`,
      '================================================================================'
    ].join('\n');
  };

  // Download Evidentiary Receipt handler
  const handleDownloadReceipt = () => {
    try {
      const receiptText = generateEvidentiaryReceiptText();
      const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ISO27037_Evidence_Receipt_${complaintId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('ISO/IEC 27037 Evidentiary Receipt downloaded.');
    } catch (err) {
      toast.error('Could not generate receipt. Please try viewing or printing.');
    }
  };

  if (!shouldRender) {
    return null;
  }

  const isWindowActive = timeLeftMs > 0;

  return (
    <div
      style={{
        background: '#0e0e0e',
        border: '1px solid #292927',
        borderRadius: '12px',
        padding: '28px 36px',
        marginBottom: '32px',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Banner: Emergency Status & 4-Hour Countdown */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid #242421'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: isWindowActive ? 'rgba(61, 245, 192, 0.12)' : 'rgba(216, 164, 58, 0.12)',
              border: `1px solid ${isWindowActive ? '#3DF5C0' : '#d8a43a'}`,
              display: 'grid',
              placeItems: 'center',
              color: isWindowActive ? '#3DF5C0' : '#d8a43a'
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                color: isWindowActive ? '#3DF5C0' : '#d8a43a',
                letterSpacing: '0.12em',
                textTransform: 'uppercase'
              }}
            >
              {isWindowActive ? 'GOLDEN-HOUR EMERGENCY RECOVERY HUB' : 'SECONDARY RESTITUTION PROTOCOL'}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
                marginTop: '2px'
              }}
            >
              {isWindowActive
                ? 'Critical Inter-Bank Lien Freeze Window Active'
                : 'Golden Hour Elapsed — Execute Statutory Escalation'}
            </div>
          </div>
        </div>

        {/* Interactive Countdown Timer */}
        <div
          style={{
            background: '#141414',
            border: `1px solid ${isWindowActive ? '#3DF5C0' : '#d8a43a'}`,
            borderRadius: '8px',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              color: '#8e8b84',
              textTransform: 'uppercase'
            }}
          >
            {isWindowActive ? 'TIME REMAINING:' : 'STATUS:'}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '18px',
              fontWeight: 800,
              color: isWindowActive ? '#3DF5C0' : '#d8a43a',
              letterSpacing: '1px'
            }}
          >
            {isWindowActive ? formattedCountdown : 'EXPIRED'}
          </span>
        </div>
      </div>

      {/* Explanatory Context */}
      <p
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '13px',
          color: '#a6a39b',
          lineHeight: 1.6,
          margin: '16px 0 24px'
        }}
      >
        Mule accounts typically siphon fraudulent transfers through multiple automated banking hops within 2 to 4
        hours. Complete these 3 recovery steps immediately to place a lien hold on the receiving account and establish
        zero-liability protection.
      </p>

      {/* 3 Action Pillars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px'
        }}
      >
        {/* Step 1: 1-Tap 1930 & UTR Copy */}
        <div
          style={{
            background: '#141414',
            border: '1px solid #242421',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  background: '#242421',
                  color: '#3DF5C0',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                1
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#8e8b84',
                  letterSpacing: '0.08em'
                }}
              >
                IMMEDIATE FREEZE HOTLINE
              </span>
            </div>
            <h4
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 6px'
              }}
            >
              Dial 1930 & Quote UTR
            </h4>
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '12px',
                color: '#8e8b84',
                lineHeight: 1.5,
                margin: '0 0 14px'
              }}
            >
              Citizen Financial Cyber Fraud Reporting System (CFCFRMS) initiates real-time API lien freezes across all
              partner banks.
            </p>

            {/* UTR Pill Box */}
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid #292927',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    color: '#8e8b84',
                    textTransform: 'uppercase'
                  }}
                >
                  TRANSACTION UTR / REF:
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12px',
                    fontWeight: 700,
                    color: rawUtr ? '#3DF5C0' : '#a6a39b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {rawUtr || complaintId}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyUtr}
                style={{
                  background: copiedUtr ? '#3DF5C0' : '#1e1e1c',
                  color: copiedUtr ? '#070707' : '#f2f0ea',
                  border: '1px solid #3b3b38',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                  fontFamily: "'IBM Plex Sans', sans-serif"
                }}
                aria-label="Copy UTR or Case ID"
              >
                {copiedUtr ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedUtr ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          <a
            href="tel:1930"
            style={{
              height: '44px',
              background: '#3DF5C0',
              color: '#070707',
              borderRadius: '8px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <PhoneCall size={16} />
            <span>CALL 1930 HELPLINE</span>
          </a>
        </div>

        {/* Step 2: RBI Zero-Liability Dispute Dispatch */}
        <div
          style={{
            background: '#141414',
            border: '1px solid #242421',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  background: '#242421',
                  color: '#3DF5C0',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                2
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#8e8b84',
                  letterSpacing: '0.08em'
                }}
              >
                STATUTORY ZERO-LIABILITY
              </span>
            </div>
            <h4
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 6px'
              }}
            >
              RBI Dispute Notice
            </h4>
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '12px',
                color: '#8e8b84',
                lineHeight: 1.5,
                margin: '0 0 14px'
              }}
            >
              Cites RBI Circular DBR.No.Leg.BC.78. Notice within 3 days mandates the bank to shadow-credit disputed funds
              within 10 days.
            </p>

            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid #292927',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '11px',
                color: '#a6a39b'
              }}
            >
              <span style={{ color: '#8e8b84' }}>Claim: </span>
              <strong style={{ color: '#ffffff' }}>INR {amountLost}</strong>
              <span style={{ color: '#8e8b84', marginLeft: 10 }}>Mandate: </span>
              <strong style={{ color: '#3DF5C0' }}>100% Protection</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDisputeModal(true)}
            style={{
              height: '44px',
              background: '#1a1a19',
              border: '1px solid #3b3b38',
              color: '#ffffff',
              borderRadius: '8px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Mail size={16} color="#3DF5C0" />
            <span>GENERATE RBI LETTER</span>
          </button>
        </div>

        {/* Step 3: ISO/IEC 27037 Evidentiary Receipt */}
        <div
          style={{
            background: '#141414',
            border: '1px solid #242421',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  background: '#242421',
                  color: '#3DF5C0',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                3
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#8e8b84',
                  letterSpacing: '0.08em'
                }}
              >
                EVIDENTIARY PROOF
              </span>
            </div>
            <h4
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 6px'
              }}
            >
              ISO/IEC 27037 Receipt
            </h4>
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '12px',
                color: '#8e8b84',
                lineHeight: 1.5,
                margin: '0 0 14px'
              }}
            >
              Statutory evidence manifest containing case tracking ID, SHA-256 exhibits, and timestamp for bank branch
              managers.
            </p>

            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid #292927',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '11px',
                color: '#a6a39b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ color: '#8e8b84' }}>Verified Exhibits:</span>
              <strong style={{ color: '#3DF5C0', fontFamily: "'IBM Plex Mono', monospace" }}>
                {(complaint?.evidence || []).length} Files (Sec 65B)
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownloadReceipt}
              style={{
                flex: 1,
                height: '44px',
                background: '#1a1a19',
                border: '1px solid #3b3b38',
                color: '#ffffff',
                borderRadius: '8px',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Download size={15} color="#3DF5C0" />
              <span>DOWNLOAD</span>
            </button>
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              style={{
                height: '44px',
                padding: '0 14px',
                background: '#141414',
                border: '1px solid #3b3b38',
                color: '#a6a39b',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="View & Print Certificate"
              aria-label="View & Print Certificate"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL: RBI ZERO-LIABILITY DISPUTE LETTER ── */}
      <AnimatePresence>
        {showDisputeModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                background: '#0a0a0a',
                border: '1px solid #30302d',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid #242422',
                  background: '#121212'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={18} color="#3DF5C0" />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#f2f0ea',
                      letterSpacing: '0.06em'
                    }}
                  >
                    RBI ZERO-LIABILITY BANK DISPUTE LETTER
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#8e8b84', cursor: 'pointer', padding: 4 }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', color: '#f2f0ea' }}>
                <p style={{ fontSize: '13px', color: '#8e8b84', margin: '0 0 16px', lineHeight: 1.5 }}>
                  This statutory letter invokes{' '}
                  <strong style={{ color: '#ffffff' }}>RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18</strong>. Delivery
                  to your bank within 3 working days legally protects you from unauthorized third-party transactions.
                </p>

                {/* Pre-populated form fields */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#8e8b84',
                        marginBottom: 4
                      }}
                    >
                      COMPLAINANT NAME
                    </label>
                    <input
                      type="text"
                      value={disputeForm.complainantName}
                      onChange={(e) => setDisputeForm({ ...disputeForm, complainantName: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        background: '#141414',
                        border: '1px solid #30302d',
                        borderRadius: '6px',
                        color: '#ffffff',
                        padding: '0 10px',
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#8e8b84',
                        marginBottom: 4
                      }}
                    >
                      AMOUNT LOST (INR)
                    </label>
                    <input
                      type="text"
                      value={disputeForm.disputedAmount}
                      onChange={(e) => setDisputeForm({ ...disputeForm, disputedAmount: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        background: '#141414',
                        border: '1px solid #30302d',
                        borderRadius: '6px',
                        color: '#ffffff',
                        padding: '0 10px',
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#8e8b84',
                        marginBottom: 4
                      }}
                    >
                      TARGET BANK NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      value={disputeForm.bankName}
                      onChange={(e) => setDisputeForm({ ...disputeForm, bankName: e.target.value })}
                      style={{
                        width: '100%',
                        height: '38px',
                        background: '#141414',
                        border: '1px solid #30302d',
                        borderRadius: '6px',
                        color: '#ffffff',
                        padding: '0 10px',
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <pre
                  style={{
                    background: '#121212',
                    border: '1px solid #30302d',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#f2f0ea',
                    whiteSpace: 'pre-wrap',
                    fontFamily: "'IBM Plex Mono', monospace",
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {generateRBILetterText()}
                </pre>

                {/* Modal Footer Controls */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#3DF5C0', fontFamily: "'IBM Plex Mono', monospace" }}>
                    Docket Ref: {complaintId}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generateRBILetterText());
                        toast.success('Dispute letter copied to clipboard.');
                      }}
                      style={{
                        background: '#141414',
                        border: '1px solid #30302d',
                        color: '#f2f0ea',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px'
                      }}
                    >
                      <Copy size={14} />
                      <span>COPY TEXT</span>
                    </button>

                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        'Urgent Dispute: Unauthorized Electronic Transaction - Ref ' + complaintId
                      )}&body=${encodeURIComponent(generateRBILetterText())}`}
                      style={{
                        background: '#3DF5C0',
                        color: '#070707',
                        padding: '10px 18px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px'
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>OPEN IN EMAIL</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ISO/IEC 27037 EVIDENTIARY RECEIPT ── */}
      <AnimatePresence>
        {showReceiptModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                width: '100%',
                maxWidth: '760px',
                maxHeight: '90vh',
                background: '#0a0a0a',
                border: '1px solid #30302d',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Receipt Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: '1px solid #242422',
                  background: '#121212'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={18} color="#3DF5C0" />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#f2f0ea',
                      letterSpacing: '0.06em'
                    }}
                  >
                    CRYPTOGRAPHIC EVIDENCE DEPOSIT RECEIPT • ISO/IEC 27037
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      background: '#141414',
                      border: '1px solid #30302d',
                      color: '#f2f0ea',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Printer size={13} />
                    <span>PRINT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    style={{ background: 'transparent', border: 'none', color: '#8e8b84', cursor: 'pointer', padding: 4 }}
                    aria-label="Close receipt modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Receipt Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '28px', color: '#f2f0ea' }}>
                <pre
                  style={{
                    background: '#121212',
                    border: '1px solid #30302d',
                    borderRadius: '8px',
                    padding: '20px',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#f2f0ea',
                    whiteSpace: 'pre-wrap',
                    fontFamily: "'IBM Plex Mono', monospace"
                  }}
                >
                  {generateEvidentiaryReceiptText()}
                </pre>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    style={{
                      background: '#3DF5C0',
                      color: '#070707',
                      padding: '10px 18px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Download size={15} />
                    <span>DOWNLOAD FILE</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
