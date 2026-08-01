const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const MailLog = require('../models/MailLog');

// Initialize Gemini AI client if API key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate email content using Gemini API
 */
async function generateEmailContent(prompt) {
  try {
    if (!genAI) {
      logger.warn('GEMINI_API_KEY not configured. Falling back to default email template.');
      return null;
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    logger.error(`Error generating email content: ${error.message}`);
    return null;
  }
}

/**
 * Send an email to a user when their complaint status is updated
 */
exports.sendStateChangeEmail = async (user, complaint, oldStatus, newStatus, message) => {
  if (!user || !user.email) return;

  try {
    let emailSubject = `Update on your Cybercrime Complaint: ${complaint.complaintId} - Status: ${newStatus.toUpperCase()}`;
    let emailBody = '';

    const prompt = `
      You are an official Cybercrime Department AI Assistant.
      Write a professional, empathetic email to a citizen named "${user.name}".
      Their complaint (ID: ${complaint.complaintId}, Category: ${complaint.category}) status has just changed from "${oldStatus}" to "${newStatus}".
      Please ensure you explicitly and prominently state the new status ("${newStatus}") early in the email.
      Additional official notes: "${message || 'No additional notes'}".
      
      Keep the email concise, reassuring, and professional. The email should start with "Dear ${user.name}," and end with a formal sign-off from "Cybercrime Department".
      Do not include placeholders like [Your Name]. Just provide the raw text of the email body.
    `;

    const generatedBody = await generateEmailContent(prompt);

    if (generatedBody) {
      emailBody = generatedBody;
    } else {
      // Fallback template
      emailBody = `Dear ${user.name},\n\nWe wanted to inform you that the status of your complaint (ID: ${complaint.complaintId}) has been updated from "${oldStatus}" to "${newStatus}".\n\nNotes from our team: ${message || 'No additional notes'}\n\nThank you for your cooperation.\n\nSincerely,\nCybercrime Department`;
    }

    await MailLog.create({
      recipient: user.email,
      subject: emailSubject,
      body: emailBody,
      complaintId: complaint.complaintId
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Cybercrime Department" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: emailSubject,
        text: emailBody,
      });
      logger.info(`Status update email sent to ${user.email} for complaint ${complaint.complaintId}`);
    } else {
      logger.warn(`SMTP credentials not configured. Mail logged but not sent to ${user.email} for complaint ${complaint.complaintId}`);
    }
  } catch (error) {
    logger.error(`Failed to process status update email for ${user.email}: ${error.message}`);
  }
};

/**
 * Send an email to a user when their complaint is viewed by an admin/officer
 */
exports.sendViewedEmail = async (user, complaint, viewerRole) => {
  if (!user || !user.email) return;

  try {
    let emailSubject = `Your Cybercrime Complaint (${complaint.complaintId}) is being reviewed`;
    let emailBody = '';

    const prompt = `
      You are an official Cybercrime Department AI Assistant.
      Write a short, professional, and reassuring email to a citizen named "${user.name}".
      Inform them that their cybercrime complaint (ID: ${complaint.complaintId}, Category: ${complaint.category}) has just been viewed by an assigned ${viewerRole} and is currently under active attention.
      
      Keep the email concise, reassuring, and professional. The email should start with "Dear ${user.name}," and end with a formal sign-off from "Cybercrime Department".
      Do not include placeholders like [Your Name]. Just provide the raw text of the email body.
    `;

    const generatedBody = await generateEmailContent(prompt);

    if (generatedBody) {
      emailBody = generatedBody;
    } else {
      // Fallback template
      emailBody = `Dear ${user.name},\n\nWe wanted to let you know that your complaint (ID: ${complaint.complaintId}) has been viewed by our ${viewerRole} and is currently under attention.\n\nWe will notify you if there are any further updates.\n\nSincerely,\nCybercrime Department`;
    }

    await MailLog.create({
      recipient: user.email,
      subject: emailSubject,
      body: emailBody,
      complaintId: complaint.complaintId
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Cybercrime Department" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: emailSubject,
        text: emailBody,
      });
      logger.info(`Viewed notification email sent to ${user.email} for complaint ${complaint.complaintId}`);
    } else {
      logger.warn(`SMTP credentials not configured. Mail logged but not sent to ${user.email} for complaint ${complaint.complaintId}`);
    }
  } catch (error) {
    logger.error(`Failed to process viewed notification email for ${user.email}: ${error.message}`);
  }
};

/**
 * Send an email to admins and officers when a new complaint is filed
 */
exports.sendNewComplaintAlert = async (adminsAndOfficers, complaint, user) => {
  if (!adminsAndOfficers || adminsAndOfficers.length === 0) return;

  try {
    let emailSubject = `[URGENT] New ${complaint.severity.toUpperCase()} Severity Cybercrime Complaint Filed`;
    let emailBody = '';

    const prompt = `
      You are the Cybercrime System Dispatcher.
      A new cybercrime complaint has just been filed by "${user.name}" (${user.email}).
      Complaint ID: ${complaint.complaintId}
      Category: ${complaint.category}
      Severity: ${complaint.severity}
      
      Write a short, urgent briefing email to the department's Admins and Officers alerting them to review this new case immediately.
      Keep it professional and concise. Just provide the raw text of the email body.
    `;

    const generatedBody = await generateEmailContent(prompt);

    if (generatedBody) {
      emailBody = generatedBody;
    } else {
      emailBody = `Attention Admins and Officers,\n\nA new cybercrime complaint has been filed by ${user.name} (${user.email}).\n\nComplaint ID: ${complaint.complaintId}\nCategory: ${complaint.category}\nSeverity: ${complaint.severity}\n\nPlease log in to the CyberGuard dashboard to review and assign this case immediately.\n\nCyberGuard Automated Dispatch System`;
    }

    const emailPromises = adminsAndOfficers.map(async (admin) => {
      await MailLog.create({
        recipient: admin.email,
        subject: emailSubject,
        body: emailBody,
        complaintId: complaint.complaintId
      });

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: `"Cybercrime Dispatch" <${process.env.SMTP_USER}>`,
          to: admin.email,
          subject: emailSubject,
          text: emailBody,
        });
        logger.info(`New complaint alert sent to ${admin.email}`);
      }
    });

    await Promise.allSettled(emailPromises);
  } catch (error) {
    logger.error(`Failed to process new complaint alert: ${error.message}`);
  }
};

/**
 * Send an OTP to a user for login verification
 */
exports.sendLoginOtpEmail = async (user, otp) => {
  if (!user || !user.email) return;

  try {
    let emailSubject = `Your CyberGuard Login OTP: ${otp}`;
    let emailBody = '';

    const prompt = `
      You are the Cybercrime System Authenticator.
      A user named "${user.name}" is trying to log in.
      Their One-Time Password (OTP) is: ${otp}
      
      Write a short, professional email providing this OTP. Warn them not to share it with anyone.
      Keep it concise and professional. Just provide the raw text of the email body.
    `;

    const generatedBody = await generateEmailContent(prompt);

    if (generatedBody) {
      emailBody = generatedBody;
    } else {
      emailBody = `Dear ${user.name},\n\nYour One-Time Password (OTP) for login is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.\n\nCyberGuard Automated System`;
    }

    await MailLog.create({
      recipient: user.email,
      subject: emailSubject,
      body: emailBody,
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"CyberGuard Auth" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: emailSubject,
        text: emailBody,
      });
      logger.info(`Login OTP email sent to ${user.email}`);
    } else {
      logger.warn(`SMTP credentials not configured. Mail logged but not sent to ${user.email} (OTP: ${otp})`);
    }
  } catch (error) {
    logger.error(`Failed to send login OTP email to ${user.email}: ${error.message}`);
  }
};
