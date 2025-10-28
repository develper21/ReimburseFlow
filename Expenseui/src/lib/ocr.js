import Tesseract from 'tesseract.js'

/**
 * Extract text from an image file using Tesseract OCR
 * @param {File} file - Image file to process
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromImage(file) {
  try {
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
    return data.text
  } catch (error) {
    console.error('OCR Error:', error)
    return ''
  }
}

/**
 * Parse amount from OCR text
 * Looks for common currency patterns and amounts
 * @param {string} text - OCR extracted text
 * @returns {string|null} Parsed amount or null
 */
export function parseAmount(text) {
  // Pattern matches: $123.45, Rs 1,234.56, INR 1234, USD123.45, etc.
  const patterns = [
    /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
    /(?:\$|USD)\s*([\d,]+\.?\d*)/i,
    /(?:€|EUR)\s*([\d,]+\.?\d*)/i,
    /(?:£|GBP)\s*([\d,]+\.?\d*)/i,
    /\b([\d,]+\.\d{2})\b/,
    /\b([\d,]+)\b/
  ]

  for (const pattern of patterns) {
    const matches = [...text.matchAll(new RegExp(pattern, 'g'))]
    if (matches.length > 0) {
      // Get the largest amount found (likely the total)
      const amounts = matches.map(m => parseFloat(m[1].replace(/,/g, '')))
      const maxAmount = Math.max(...amounts)
      return maxAmount.toString()
    }
  }

  return null
}

/**
 * Parse date from OCR text
 * Looks for common date patterns
 * @param {string} text - OCR extracted text
 * @returns {string|null} Parsed date in YYYY-MM-DD format or null
 */
export function parseDate(text) {
  // Patterns for various date formats
  const patterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/,
    // YYYY/MM/DD or YYYY-MM-DD
    /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
    // DD Mon YYYY (e.g., 15 Jan 2024)
    /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/i
  ]

  const monthMap = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  }

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      if (match[0].includes('Jan') || match[0].includes('Feb')) {
        // DD Mon YYYY format
        const day = match[1].padStart(2, '0')
        const month = monthMap[match[2].toLowerCase().substring(0, 3)]
        const year = match[3]
        return `${year}-${month}-${day}`
      } else if (match[1].length === 4) {
        // YYYY-MM-DD format
        const year = match[1]
        const month = match[2].padStart(2, '0')
        const day = match[3].padStart(2, '0')
        return `${year}-${month}-${day}`
      } else {
        // DD-MM-YYYY format
        const day = match[1].padStart(2, '0')
        const month = match[2].padStart(2, '0')
        const year = match[3]
        return `${year}-${month}-${day}`
      }
    }
  }

  return null
}

/**
 * Parse merchant/vendor name from OCR text
 * Usually the first line or prominent text
 * @param {string} text - OCR extracted text
 * @returns {string|null} Parsed merchant name or null
 */
export function parseMerchant(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  if (lines.length > 0) {
    // Return first non-empty line, limited to 50 chars
    return lines[0].trim().substring(0, 50)
  }
  return null
}

/**
 * Parse all receipt data at once
 * @param {File} file - Image file to process
 * @returns {Promise<Object>} Parsed receipt data
 */
export async function parseReceipt(file) {
  const text = await extractTextFromImage(file)
  
  return {
    rawText: text,
    amount: parseAmount(text),
    date: parseDate(text),
    merchant: parseMerchant(text)
  }
}
