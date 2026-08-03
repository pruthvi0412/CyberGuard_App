const twilio = require('twilio');
const logger = require('../utils/logger');

// Initialize Twilio only when real credentials are present.
// Placeholder values (e.g. '<copy_from_my_env>') are skipped gracefully.
let client = null;
const sid   = process.env.TWILIO_ACCOUNT_SID  || '';
const token = process.env.TWILIO_AUTH_TOKEN   || '';

if (sid.startsWith('AC') && token && token !== '<copy_from_my_env>') {
  try {
    client = twilio(sid, token);
    logger.info('Twilio SMS client initialized.');
  } catch (err) {
    logger.warn(`Twilio initialization failed (SMS disabled): ${err.message}`);
  }
} else {
  logger.info('Twilio credentials not configured — SMS features disabled.');
}

/**
 * Send an SMS to a user when their complaint status is updated
 */
exports.sendStatusUpdateSMS = async (user, complaint, newStatus, message) => {
  if (!user || !user.phone) {
    logger.info(`Cannot send SMS: No phone number registered for user ${user._id}`);
    return;
  }

  if (!client || (!process.env.TWILIO_PHONE_NUMBER && !process.env.TWILIO_MESSAGING_SERVICE_SID)) {
    logger.warn('Twilio credentials not configured. SMS not sent.');
    return;
  }

  try {
    let body = `Cybercrime Dept: Your complaint (ID: ${complaint.complaintId}) status has been updated to "${newStatus.toUpperCase()}".`;
    if (message) {
      body += ` Notes: ${message}`;
    }

    // Ensure phone number has country code. Assuming Indian numbers as per regex in User schema.
    let toPhoneNumber = user.phone;
    if (!toPhoneNumber.startsWith('+')) {
      toPhoneNumber = `+91${toPhoneNumber}`;
    }

    const messagePayload = {
      body: body,
      to: toPhoneNumber,
    };

    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      messagePayload.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else {
      messagePayload.from = process.env.TWILIO_PHONE_NUMBER;
    }

    await client.messages.create(messagePayload);
    
    logger.info(`Status update SMS sent to ${toPhoneNumber} for complaint ${complaint.complaintId}`);
  } catch (error) {
    logger.error(`Failed to send status update SMS to ${user.phone}: ${error.message}`);
  }
};
