const PII_PATTERNS = [
  // 1. URL
  {
    type: 'URL',
    regex: /\b(?:https?|ftp):\/\/[^\s<>"'(){}[\]|\\^`]+|\bwww\.[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\/[^\s<>"'(){}[\]|\\^`]+)?/gi,
  },

  // 1b. UPI_ID
  {
    type: 'UPI_ID',
    regex: /(?:upi(?:\s*(?:id|vpa|payment))?[\s:]*)?([a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9]{2,64}\b(?!\.[A-Za-z]))/gi,
  },

  // 2. EMAIL
  {
    type: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
  },

  // 3. IPV6
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

  // 6. BANK_ACCOUNT
  {
    type: 'BANK_ACCOUNT',
    regex: /(?:(?:bank\s+)?account(?:\s*(?:number|no|num|#))?|acc?(?:\s*(?:number|no|num|#))?|a\/c(?:[\s\-]*no)?|bank\s*acc?|(?:account\s+holder[\s\S]{0,40}?)?number|no)[\s:]*([0-9]{9,18})/gi,
  },

  // 7. DRIVING_LICENSE
  {
    type: 'DRIVING_LICENSE',
    regex: /(?:driving\s+licen[sc]e(?:\s+(?:number|no|num|#))?|dl(?:\s+(?:number|no|num|#))?)?[\s:]*\b([A-Z]{2}[-\s]?\d{2}[-\s]?(?:19|20)\d{2}[-\s]?\d{6,7})\b/gi,
  },

  // 8. PASSPORT - Indian passport: 1 letter + 7 digits
  {
    type: 'PASSPORT',
    regex: /(?:passport(?:\s+(?:number|no|num|#))?[\s:]*)?\b([A-PR-WY][1-9]\d{6})\b/gi,
  },

  // 9. AADHAAR
  {
    type: 'AADHAAR',
    regex: /(?:aadhaar(?:\s+(?:card|number|no|num|#))?|aadhar(?:\s+(?:card|number|no|num|#))?|uidai)[\s:]*([2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4})\b|\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b/gi,
  },

  // 10. PAN
  {
    type: 'PAN',
    regex: /(?:pan(?:\s+(?:card|number|no|num|#))?[\s:]*)?([A-Z]{5}[0-9]{4}[A-Z])\b/gi,
  },

  // 11. IFSC
  {
    type: 'IFSC',
    regex: /(?:ifsc(?:\s+code)?[\s:]*)?([A-Z]{4}0[A-Z0-9]{6})\b/gi,
  },

  // 12. PHONE
  {
    type: 'PHONE',
    regex: /(?:(?:phone|mobile|whatsapp|contact|tel|call)(?:\s+(?:number|no|num|#))?[\s:]*)?((?:\(?\+91\)?[\s\-]?|0)?[6-9]\d{4}[\s\-]?\d{5}\b|(?:\(?\+91\)?[\s\-]?|0)?[6-9]\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|\+[1-9]\d{6,14}\b)/gi,
  },

  // 13. PERSON - Strict case-sensitive name capture without /i flag
  {
    type: 'PERSON',
    regex: /(?:[Ii]'?m\s+(?:called\s+)?|[Ii]\s+am\s+(?:called\s+)?|[Mm]yself\s+|(?:[Mm]y|[Hh]is|[Hh]er|[Tt]heir|[Oo]ur|[Yy]our)\s+[Nn]ame\s+[Ii]s|[Pp]eople\s+[Cc]all\s+[Mm]e|[Tt]his\s+[Ii]s|[Rr]egards,?|[Nn]ame\s*:|[Vv]ictim\s*:|[Cc]omplainant\s*:|[Ss]eller\s*:|[Bb]uyer\s*:|[Aa]ccount\s+[Hh]older\s*:|[Ff]ather'?s?\s+[Nn]ame\s*:|[Mm]other'?s?\s+[Nn]ame\s*:|[Uu]ser\s*:|[Hh]older\s*:)\s*([A-Z][a-z]+(?:\s+(?!(?:Number|No|Num|Phone|Mobile|Email|Address|City|State|Pincode|Zip|Account|Bank|Ifsc|Pan|Aadhaar|Upi|Id|Passport|License|Licence|Website|Url|Date|Holder|Status|Category|Details|Info|Brief|Incident)\b)[A-Z][a-z]+){0,2})/g,
  },

  // 14. ORGANIZATION
  {
    type: 'ORGANIZATION',
    regex: /\b(?:[A-Z][a-zA-Z&]*)(?:\s+[A-Z][a-zA-Z&]*){0,3}\s+(?:Ltd|Limited|Inc|Incorporated|Corp|Corporation|Pvt|Private|LLP|PLC|GmbH|LLC|Co\.|Solutions|Technologies|Enterprises|Services|Group|Bank)\b/g,
  },

  // 15. ADDRESS - stops at period, comma, or newline
  {
    type: 'ADDRESS',
    regex: /(?:(?:[Ii]\s+live\s+at|[Aa]ddress|[Ll]ocation|[Rr]esidence)[\s:]*)?((?:(?:door|flat|plot|house|apt|apartment|villa|building|block|wing|floor|room|no\.?|#)\s*[A-Za-z0-9\-\/]+|\b\d{1,4}[A-Za-z]?(?:[\/-]\d+)?)[\s,]+[^,\n\.]{3,60}(?:road|street|nagar|colony|layout|cross|avenue|lane|extension|ext|marg|sector|phase|main|bypass|highway|way|close|row|place|park|square|circle|drive|court|trail|boulevard|blvd)[^,\n\.]{0,30})/gi,
  },

  // 16. PINCODE
  {
    type: 'PINCODE',
    regex: /(?:pin(?:\s*code)?|pincode|postal\s*code|zip(?:\s*code)?)[\s:\-]*([1-9]\d{5})\b|\b(?<=[,\s\n])[1-9]\d{5}\b(?=[,\.\s\n]|$)/gi,
  },

  // 17. SOCIAL_HANDLE
  {
    type: 'SOCIAL_HANDLE',
    regex: /(?:telegram|instagram|insta|twitter|x|tik\s*tok)(?:\s+handle|\s+id|\s+user)?[\s:]*(@?[A-Za-z0-9_]{3,32})\b|(?<![\w.])(@[A-Za-z0-9_]{3,32})\b/gi,
  },

  // 18. CITY
  {
    type: 'CITY',
    regex: /\b(?:Bangalore|Bengaluru|Mumbai|Delhi|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Surat|Lucknow|Kanpur|Nagpur|Patna|Indore|Bhopal|Vadodara|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Varanasi|Srinagar|Aurangabad|Amritsar|Ranchi|Coimbatore|Visakhapatnam|Mysore|Mysuru|Kochi|Guwahati|Chandigarh|Bhubaneswar|New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|London|Paris|Berlin|Tokyo|Sydney|Singapore|Dubai|Toronto|Shanghai|Beijing)\b/gi,
  },
];

function maskPII(text) {
  if (!text || typeof text !== 'string') {
    return { original: text, masked: text, detected: [] };
  }

  let masked = text;
  const valueMap = new Map();
  const detected = [];

  for (const { type, regex } of PII_PATTERNS) {
    regex.lastIndex = 0;

    if (!valueMap.has(type)) {
      valueMap.set(type, new Map());
    }
    const typeMap = valueMap.get(type);

    masked = masked.replace(regex, (match, ...args) => {
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

      const key = rawValue.toLowerCase().trim();
      let token;

      if (typeMap.has(key)) {
        token = typeMap.get(key);
      } else {
        token = type + '_' + (typeMap.size + 1);
        typeMap.set(key, token);
        detected.push({ type, value: rawValue, token });
      }

      return prefix + token + suffix;
    });

    regex.lastIndex = 0;
  }

  return { original: text, masked, detected };
}

const input = 'Hi, I am Rahul Sharma living at 45 Residency Road Bangalore 560025. Passport: R1234567, DL: KA0120230001234. Website: www.phish.com';
const res = maskPII(input);
console.log("Input: ", input);
console.log("Masked:", res.masked);
console.log("Detected:", res.detected);
