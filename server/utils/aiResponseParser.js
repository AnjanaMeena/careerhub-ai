/**
 * AI Response Parser — Single reusable module for all Gemini AI responses.
 * 
 * Usage:
 *   const { parseAIResponse } = require('../utils/aiResponseParser');
 *   const result = parseAIResponse(rawText, ['score', 'strengths', 'weaknesses']);
 */

class AiParseError extends Error {
  constructor(message, rawText) {
    super(message);
    this.name = 'AiParseError';
    this.rawText = rawText;
  }
}

/**
 * Strip markdown code fences and surrounding prose from raw Gemini response text.
 * Handles ```json ... ```, ``` ... ```, and plain text with embedded JSON.
 */
function stripMarkdownFences(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text.trim();

  // Remove ```json ... ``` or ```JSON ... ``` or ``` ... ``` blocks
  const fenceRegex = /```(?:json|JSON)?\s*\n?([\s\S]*?)```/;
  const fenceMatch = cleaned.match(fenceRegex);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  return cleaned;
}

/**
 * Extract the first JSON object {...} or array [...] from a string.
 * Handles nested braces/brackets properly by counting depth.
 */
function extractJsonBlock(text) {
  if (!text) return null;

  const objStart = text.indexOf('{');
  const arrStart = text.indexOf('[');

  let startIdx, openChar, closeChar;

  if (objStart === -1 && arrStart === -1) return null;

  if (objStart === -1) {
    startIdx = arrStart; openChar = '['; closeChar = ']';
  } else if (arrStart === -1) {
    startIdx = objStart; openChar = '{'; closeChar = '}';
  } else {
    if (objStart < arrStart) {
      startIdx = objStart; openChar = '{'; closeChar = '}';
    } else {
      startIdx = arrStart; openChar = '['; closeChar = ']';
    }
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\' && inString) { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === openChar) depth++;
    if (ch === closeChar) depth--;
    if (depth === 0) return text.substring(startIdx, i + 1);
  }

  return null;
}

/**
 * Parse a raw Gemini AI response into a validated JSON object.
 * 
 * @param {string} rawText - Raw text from Gemini API response
 * @param {string[]} [requiredKeys=[]] - Keys that must exist on the parsed object
 * @returns {object} Parsed and validated JSON object
 * @throws {AiParseError} If parsing or validation fails
 */
function parseAIResponse(rawText, requiredKeys = []) {
  if (!rawText || typeof rawText !== 'string') {
    throw new AiParseError('Empty or null AI response received', rawText);
  }

  // Step 1: Strip markdown fences
  let cleaned = stripMarkdownFences(rawText);

  // Step 2: Try JSON.parse on the cleaned string
  try {
    const parsed = JSON.parse(cleaned);
    validateSchema(parsed, requiredKeys, rawText);
    return parsed;
  } catch (firstError) {
    // Not valid JSON after stripping fences — try regex extraction
  }

  // Step 3: Retry with regex extraction of first JSON block
  const jsonBlock = extractJsonBlock(cleaned) || extractJsonBlock(rawText);
  if (jsonBlock) {
    try {
      const parsed = JSON.parse(jsonBlock);
      validateSchema(parsed, requiredKeys, rawText);
      return parsed;
    } catch (secondError) {
      throw new AiParseError(
        `Found JSON-like block but failed to parse: ${secondError.message}`,
        rawText
      );
    }
  }

  // Step 4: Genuine failure
  throw new AiParseError(
    'Could not extract valid JSON from AI response. Raw text did not contain a parseable JSON object or array.',
    rawText
  );
}

/**
 * Validate that a parsed object contains all required keys.
 */
function validateSchema(parsed, requiredKeys, rawText) {
  if (!requiredKeys || requiredKeys.length === 0) return;

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    if (requiredKeys.length > 0 && !Array.isArray(parsed)) {
      throw new AiParseError(
        `Expected an object with keys [${requiredKeys.join(', ')}] but got ${typeof parsed}`,
        rawText
      );
    }
    return;
  }

  const missingKeys = requiredKeys.filter(key => !(key in parsed));
  if (missingKeys.length > 0) {
    throw new AiParseError(
      `AI response is missing required keys: [${missingKeys.join(', ')}]. Got keys: [${Object.keys(parsed).join(', ')}]`,
      rawText
    );
  }
}

module.exports = {
  parseAIResponse,
  stripMarkdownFences,
  extractJsonBlock,
  AiParseError
};
