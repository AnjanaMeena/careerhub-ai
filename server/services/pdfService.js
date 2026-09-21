const fs = require('fs');
const pdfParse = require('pdf-parse');
const { sanitizePII } = require('../utils/piiSanitizer');

/**
 * Parses text content from a PDF file on disk and sanitizes all PII.
 * @param {string} filePath - Absolute or relative path to PDF file
 * @param {string} studentName - Optional student name for anonymization
 * @returns {Promise<{ rawText: string, sanitizedText: string }>}
 */
const extractAndSanitizePdfText = async (filePath, studentName = '') => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[pdfService]: File path does not exist: ${filePath}`);
      return { rawText: '', sanitizedText: '' };
    }

    const dataBuffer = fs.readFileSync(filePath);
    
    // Attempt pdf-parse
    let rawText = '';
    try {
      const parsed = await pdfParse(dataBuffer);
      rawText = parsed.text || '';
    } catch (parseErr) {
      console.warn('[pdfService]: pdf-parse failed, falling back to raw buffer string:', parseErr.message);
      rawText = dataBuffer.toString('utf8');
    }

    // Clean up excessive whitespace/newlines
    rawText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    // Sanitize PII (emails, phone numbers, URLs, SSN/IDs, name)
    const sanitizedText = sanitizePII(rawText, studentName);

    console.log(`[pdfService]: Extracted ${rawText.length} chars, PII sanitized (${sanitizedText.length} chars).`);

    return {
      rawText,
      sanitizedText
    };
  } catch (error) {
    console.error('[pdfService]: Error reading/parsing PDF file:', error.message);
    return { rawText: '', sanitizedText: '' };
  }
};

module.exports = {
  extractAndSanitizePdfText
};
