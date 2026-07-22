const Tesseract = require('tesseract.js');
const logger = require('../utils/logger');

/**
 * Perform OCR on an image and extract suspect data
 * @param {string} imagePath - Local path to the uploaded image
 * @returns {Promise<Object>} - Extracted data (text, phones, upis, accounts)
 */
exports.extractDataFromImage = async (imagePath) => {
  try {
    logger.info(`Starting OCR on evidence: ${imagePath}`);
    
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => logger.debug(m)
    });

    // Extract patterns
    const phoneRegex = /(?:\+91|91|0)?[6-9]\d{9}/g;
    const upiRegex   = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;
    const accountRegex = /\b\d{9,18}\b/g;

    const phones   = [...new Set(text.match(phoneRegex)   || [])];
    const upis     = [...new Set(text.match(upiRegex)     || [])];
    const accounts = [...new Set(text.match(accountRegex) || [])];

    logger.info(`OCR Success: Found ${phones.length} phones, ${upis.length} UPIs`);

    return {
      rawText: text,
      extracted: {
        phones,
        upis,
        accounts
      }
    };
  } catch (error) {
    logger.error(`OCR Error: ${error.message}`);
    return null;
  }
};
