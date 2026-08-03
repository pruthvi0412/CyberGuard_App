/**
 * ============================================================
 * privacyShield.js - Production-Quality PII Masking Utility
 * CyberGuard App | backend/src/utils/privacyShield.js
 * ============================================================
 *
 * Detects and masks Personally Identifiable Information (PII)
 * from user input BEFORE it is forwarded to any external AI API.
 *
 * Supported PII categories (in processing order):
 *   1.  URL              - http/https/ftp URLs and www/domain links
 *   1b. UPI_ID           - "name@handle" or "phone@handle" payment IDs
 *   2.  EMAIL            - email addresses
 *   3.  IPV6             - IPv6 addresses
 *   4.  IPV4             - IPv4 addresses
 *   5.  CREDIT_CARD      - 13-19 digit card numbers
 *   6.  BANK_ACCOUNT     - 9-18 digit account numbers with keywords
 *   7.  DRIVING_LICENSE  - Indian driving licence numbers (e.g. KA0120230001234)
 *   8.  PASSPORT         - Indian passport numbers (1 letter + 7 digits)
 *   9.  AADHAAR          - 12-digit Aadhaar numbers (starting 2-9)
 *   10. PAN              - Indian PAN card (AAAAA9999A)
 *   11. IFSC             - Indian IFSC codes (AAAA0XXXXXX)
 *   12. PHONE            - Indian / E.164 phone numbers (all formats, 5+5 & 3+3+4)
 *   13. PERSON           - name-introducing phrases + labelled fields
 *   14. ORGANIZATION     - legal entity suffixes (Ltd, Inc, Pvt ...)
 *   15. ADDRESS          - lines with door/flat/road/house keywords & numbers
 *   16. PINCODE          - Indian 6-digit postal pincodes
 *   17. SOCIAL_HANDLE    - @username and social platform handles
 *   18. CITY             - closed list of Indian & global city names
 *
 * Design principles:
 *   - All masking logic lives here; zero business logic in controllers.
 *   - More-specific patterns run before broader ones (order is critical).
 *   - Same value always gets the same placeholder within one call.
 *   - Original PII values are NEVER written to logs.
 *   - No external npm dependencies; pure Node.js + regex.
 * ============================================================
 */

'use strict';

const logger = require('./logger');

// =========================================================
// PII Pattern Definitions
// Order matters: specific patterns must precede broad ones.
// =========================================================

const PII_PATTERNS = [
  // 1. URL - run before EMAIL so "http://user@host.com" becomes URL, not EMAIL
  {
    type: 'URL',
    regex: /\b(?:https?|ftp):\/\/[^\s<>"'(){}[\]|\\^`]+|\bwww\.[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s<>"'(){}[\]|\\^`]+)?/gi,
  },

  // 1b. UPI_ID - "name@handle" or "phone@handle"
  {
    type: 'UPI_ID',
    regex: /(?:upi(?:\s*(?:id|vpa|payment))?[\s:]*)?([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9]{2,64}\b(?!\.[A-Za-z]))/gi,
  },

  // 2. EMAIL
  {
    type: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
  },

  // 3. IPV6 - run before IPv4
  {
    type: 'IPV6',
    regex: /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b|\b(?:[A-Fa-f0-9]{1,4}:)*::(?:[A-Fa-f0-9]{1,4}:)*[A-Fa-f0-9]{1,4}\b/g,
  },

  // 4. IPV4
  {
    type: 'IPV4',
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  },

  // 5. CREDIT_CARD
  {
    type: 'CREDIT_CARD',
    regex: /\b(?:\d{4}[\s\-]){3}\d{1,4}\b|\b\d{13,19}\b(?=\s|$)/g,
  },

  // 6. BANK_ACCOUNT - 9-18 digit account number with optional keyword prefix
  //    Must run BEFORE AADHAAR so 12-digit account numbers are caught correctly.
  {
    type: 'BANK_ACCOUNT',
    regex: /(?:(?:bank\s+)?account(?:\s*(?:number|no|num|#))?|acc?(?:\s*(?:number|no|num|#))?|a\/c(?:[\s\-]*no)?|bank\s*acc?|(?:account\s+holder[\s\S]{0,40}?)?number|no)[\s:]*([0-9]{9,18})/gi,
  },

  // 7. DRIVING_LICENSE - Indian format (e.g. KA0120230001234, KA-01-2023-0001234)
  {
    type: 'DRIVING_LICENSE',
    regex: /(?:driving\s+licen[sc]e(?:\s+(?:number|no|num|#))?|dl(?:\s+(?:number|no|num|#))?)?[\s:]*\b([A-Z]{2}[-\s]?\d{2}[-\s]?(?:19|20)\d{2}[-\s]?\d{6,7})\b/gi,
  },

  // 8. PASSPORT - Indian passport: 1 letter + 7 digits (e.g. R1234567)
  {
    type: 'PASSPORT',
    regex: /(?:passport(?:\s+(?:number|no|num|#))?[\s:]*)?\b([A-PR-WY][1-9]\d{6})\b/gi,
  },

  // 9. AADHAAR - 12 digits starting 2-9
  {
    type: 'AADHAAR',
    regex: /(?:aadhaar(?:\s+(?:card|number|no|num|#))?|aadhar(?:\s+(?:card|number|no|num|#))?|uidai)[\s:]*([2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4})\b|\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b/gi,
  },

  // 10. PAN - AAAAA9999A
  {
    type: 'PAN',
    regex: /(?:pan(?:\s+(?:card|number|no|num|#))?[\s:]*)?([A-Z]{5}[0-9]{4}[A-Z])\b/gi,
  },

  // 11. IFSC - AAAA0XXXXXX
  {
    type: 'IFSC',
    regex: /(?:ifsc(?:\s+code)?[\s:]*)?([A-Z]{4}0[A-Z0-9]{6})\b/gi,
  },

  // 12. PHONE - Indian 10-digit formats (3+3+4, 5+5, 10 continuous, with optional +91/0 prefix)
  {
    type: 'PHONE',
    regex: /(?:(?:phone|mobile|whatsapp|contact|tel|call)(?:\s+(?:number|no|num|#))?[\s:]*)?((?:\(?\+91\)?[\s\-]?|0)?[6-9]\d{4}[\s\-]?\d{5}\b|(?:\(?\+91\)?[\s\-]?|0)?[6-9]\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|\+[1-9]\d{6,14}\b)/gi,
  },

  // 13. PERSON - name-introducing phrases and labelled fields.
  //     Excludes trailing labels (Number, No, Phone, Email, etc.) from name capture.
  {
    type: 'PERSON',
    regex: /(?:[Ii]'?m\s+(?:called\s+)?|[Ii]\s+am\s+(?:called\s+)?|[Mm]yself\s+|(?:[Mm]y|[Hh]is|[Hh]er|[Tt]heir|[Oo]ur|[Yy]our)\s+[Nn]ame\s+[Ii]s|[Pp]eople\s+[Cc]all\s+[Mm]e|[Tt]his\s+[Ii]s|[Rr]egards,?|[Nn]ame\s*:|[Vv]ictim\s*:|[Cc]omplainant\s*:|[Ss]eller\s*:|[Bb]uyer\s*:|[Aa]ccount\s+[Hh]older\s*:|[Ff]ather'?s?\s+[Nn]ame\s*:|[Mm]other'?s?\s+[Nn]ame\s*:|[Uu]ser\s*:|[Hh]older\s*:)\s*([A-Z][a-z]+(?:\s+(?!(?:Number|No|Num|Phone|Mobile|Email|Address|City|State|Pincode|Zip|Account|Bank|Ifsc|Pan|Aadhaar|Upi|Id|Passport|License|Licence|Website|Url|Date|Holder|Status|Category|Details|Info|Brief|Incident)\b)[A-Z][a-z]+){0,2})/g,
  },

  // 14. ORGANIZATION - Title-Cased words + legal entity suffix
  {
    type: 'ORGANIZATION',
    regex: /\b(?:[A-Z][a-zA-Z&]*)(?:\s+[A-Z][a-zA-Z&]*){0,3}\s+(?:Ltd|Limited|Inc|Incorporated|Corp|Corporation|Pvt|Private|LLP|PLC|GmbH|LLC|Co\.|Solutions|Technologies|Enterprises|Services|Group|Bank)\b/g,
  },

  // 15. ADDRESS - door/flat/plot/house/street/road/nagar/colony lines (bounded by punctuation)
  {
    type: 'ADDRESS',
    regex: /(?:(?:[Ii]\s+live\s+at|[Aa]ddress|[Ll]ocation|[Rr]esidence)[\s:]*)?((?:(?:door|flat|plot|house|apt|apartment|villa|building|block|wing|floor|room|no\.?|#)\s*[A-Za-z0-9\-\/]+|\b\d{1,4}[A-Za-z]?(?:[\/-]\d+)?)[\s,]+[^,\n\.]{3,60}(?:road|street|nagar|colony|layout|cross|avenue|lane|extension|ext|marg|sector|phase|main|bypass|highway|way|close|row|place|park|square|circle|drive|court|trail|boulevard|blvd)[^,\n\.]{0,30})/gi,
  },

  // 16. PINCODE - Indian 6-digit postal code
  {
    type: 'PINCODE',
    regex: /(?:pin(?:\s*code)?|pincode|postal\s*code|zip(?:\s*code)?)[\s:\-]*([1-9]\d{5})\b|\b(?<=[,\s\n])[1-9]\d{5}\b(?=[,\.\s\n]|$)/gi,
  },

  // 17. SOCIAL_HANDLE - @username (Telegram, Instagram, Twitter/X) or platform labels
  {
    type: 'SOCIAL_HANDLE',
    regex: /(?:telegram|instagram|insta|twitter|x|tik\s*tok)(?:\s+handle|\s+id|\s+user)?[\s:]*(@?[A-Za-z0-9_]{3,32})\b|(?<![\w.])(@[A-Za-z0-9_]{3,32})\b/gi,
  },

  // 18. CITY - closed list
  {
    type: 'CITY',
    regex: /\b(?:Bangalore|Bengaluru|Mumbai|Delhi|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Surat|Lucknow|Kanpur|Nagpur|Patna|Indore|Bhopal|Vadodara|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Varanasi|Srinagar|Aurangabad|Amritsar|Ranchi|Coimbatore|Visakhapatnam|Mysore|Mysuru|Kochi|Guwahati|Chandigarh|Bhubaneswar|New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|London|Paris|Berlin|Tokyo|Sydney|Singapore|Dubai|Toronto|Shanghai|Beijing)\b/gi,
  },
];

// =========================================================
// Core Masking Engine
// =========================================================

/**
 * Scans `text` for PII and replaces every match with a consistent
 * numbered placeholder token (EMAIL_1, PHONE_1, CITY_2, etc.).
 *
 * @param {string} text - Raw user input that may contain PII.
 * @returns {{
 *   original: string,
 *   masked:   string,
 *   detected: Array<{ type: string, value: string, token: string }>
 * }}
 */
function maskPII(text) {
  // Guard: handle null, undefined, or non-string input gracefully.
  if (!text || typeof text !== 'string') {
    return { original: text, masked: text, detected: [] };
  }

  let masked = text;

  /**
   * Per-type map: normalised original value -> assigned token.
   * Guarantees the same value always gets the same placeholder.
   * Example: valueMap.get('EMAIL').get('foo@bar.com') === 'EMAIL_1'
   * @type {Map<string, Map<string, string>>}
   */
  const valueMap = new Map();

  /**
   * Flat audit list of first-occurrence PII items (for response metadata).
   * @type {Array<{ type: string, value: string, token: string }>}
   */
  const detected = [];

  for (const { type, regex } of PII_PATTERNS) {
    // Safety: always reset lastIndex before iterating with a global regex.
    regex.lastIndex = 0;

    if (!valueMap.has(type)) {
      valueMap.set(type, new Map());
    }
    const typeMap = valueMap.get(type);

    // We replace on `masked` (not the original `text`) so earlier placeholder
    // tokens do not accidentally match subsequent regex patterns.
    masked = masked.replace(regex, (match, ...args) => {
      // Find the captured PII group if present in regex
      const captureGroups = args.slice(0, args.length - 2);
      const targetValue = captureGroups.find(g => typeof g === 'string' && g.length > 0);

      let prefix = '';
      let suffix = '';
      let rawValue = match;

      if (targetValue) {
        const valIndex = match.indexOf(targetValue);
        if (valIndex !== -1) {
          prefix = match.slice(0, valIndex);
          suffix = match.slice(valIndex + targetValue.length);
          rawValue = targetValue;
        }
      }

      // Normalise key: lower-case + trim for deduplication.
      const key = rawValue.toLowerCase().trim();

      let token;
      if (typeMap.has(key)) {
        token = typeMap.get(key);                         // reuse existing
      } else {
        token = type + '_' + (typeMap.size + 1);          // assign next number
        typeMap.set(key, token);
        detected.push({ type, value: rawValue, token }); // record first occurrence
      }

      return prefix + token + suffix;
    });

    regex.lastIndex = 0; // defensive reset
  }

  return { original: text, masked, detected };
}

// =========================================================
// Safe Logging Helper
// =========================================================

/**
 * Emits a privacy summary via Winston WITHOUT revealing original PII values.
 * Only PII types and aggregate counts are written to the log.
 *
 * @param {Array<{ type: string, value: string, token: string }>} detected
 */
function logPrivacySummary(detected) {
  if (!detected || detected.length === 0) {
    logger.info('[PrivacyShield] No PII detected in request.');
    return;
  }

  // Aggregate counts per type: { EMAIL: 1, PHONE: 2, PERSON: 1, ... }
  const byType = detected.reduce((acc, { type }) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // IMPORTANT: original PII values are intentionally NEVER included here.
  logger.warn('[PrivacyShield] PII detected and masked.', {
    detectedCount: detected.length,
    byType,
  });
}

// =========================================================
// Exports
// =========================================================

module.exports = { maskPII, logPrivacySummary };