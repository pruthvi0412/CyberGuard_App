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
    let emailSubject = `Update on your Cybercrime Complaint: ${complaint.complaintId}`;
    let emailBody = '';

    const prompt = `
      You are an official Cybercrime Department AI Assistant.
      Write a professional, empathetic email to a citizen named "${user.name}".
      Their complaint (ID: ${complaint.complaintId}, Category: ${complaint.category}) status has just changed from "${oldStatus}" to "${newStatus}".
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
