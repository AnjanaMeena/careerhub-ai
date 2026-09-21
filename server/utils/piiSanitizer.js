const crypto = require('crypto');

/**
 * Utility to hash and sanitize Personally Identifiable Information (PII)
 * before sending text to external AI services (Google Gemini).
 * 
 * Hashes / masks:
 * - Email addresses -> [EMAIL_HASH_<8_char_hash>]
 * - Phone numbers -> [PHONE_HASH_<8_char_hash>]
 * - URLs & Social Links -> [URL_HASH_<8_char_hash>]
 * - Govt IDs / SSN / Aadhaar -> [ID_HASH_<8_char_hash>]
 * - Student Name -> [NAME_HASH_<8_char_hash>]
 */

const hashString = (str) => {
  if (!str) return 'xxxx';
  return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex').substring(0, 8);
};

const sanitizePII = (text = '', studentName = '') => {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // 1. Mask specific student name if provided
  if (studentName && studentName.trim().length > 1) {
    const escapedName = studentName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRegex = new RegExp(escapedName, 'gi');
    sanitized = sanitized.replace(nameRegex, `[NAME_HASH_${hashString(studentName)}]`);
  }

  // 2. Mask Email Addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  sanitized = sanitized.replace(emailRegex, (match) => `[EMAIL_HASH_${hashString(match)}]`);

  // 3. Mask Phone Numbers (Formats: +1 555-0199, 9876543210, (555) 000-1234, etc.)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b/g;
  sanitized = sanitized.replace(phoneRegex, (match) => `[PHONE_HASH_${hashString(match)}]`);

  // 4. Mask URLs, Social Links (LinkedIn, GitHub, Portfolio)
  const urlRegex = /https?:\/\/[^\s>"]+|www\.[^\s>"]+|(?:linkedin|github)\.com\/[^\s>"]+/gi;
  sanitized = sanitized.replace(urlRegex, (match) => `[URL_HASH_${hashString(match)}]`);

  // 5. Mask National IDs / SSN / Aadhaar (12-digit or 9-digit formats)
  const nationalIdRegex = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b\d{3}-\d{2}-\d{4}\b/g;
  sanitized = sanitized.replace(nationalIdRegex, (match) => `[ID_HASH_${hashString(match)}]`);

  return sanitized;
};

module.exports = {
  sanitizePII,
  hashString
};
