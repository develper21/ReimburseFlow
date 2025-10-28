/**
 * Currency conversion utilities
 */

const EXCHANGE_API_BASE = 'https://api.exchangerate-api.com/v4/latest'

/**
 * Fetch exchange rates for a base currency
 * @param {string} baseCurrency - Base currency code (e.g., 'USD')
 * @returns {Promise<Object>} Exchange rates object
 */
export async function getExchangeRates(baseCurrency) {
  try {
    const response = await fetch(`${EXCHANGE_API_BASE}/${baseCurrency}`)
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }
    const data = await response.json()
    return data.rates
  } catch (error) {
    console.error('Exchange rate fetch error:', error)
    throw error
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount
  }

  try {
    const rates = await getExchangeRates(fromCurrency)
    const rate = rates[toCurrency]
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`)
    }

    return amount * rate
  } catch (error) {
    console.error('Currency conversion error:', error)
    throw error
  }
}

/**
 * Format currency amount with symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency) {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$'
  }

  const symbol = symbols[currency] || currency
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return `${symbol} ${formatted}`
}

/**
 * Common currency codes with names
 */
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
]

/**
 * Get currency for a country
 * @param {string} countryName - Country name
 * @returns {Promise<string>} Currency code
 */
export async function getCurrencyForCountry(countryName) {
  const countryToCurrency = {
    'United States': 'USD',
    'India': 'INR',
    'United Kingdom': 'GBP',
    'Germany': 'EUR',
    'France': 'EUR',
    'Japan': 'JPY',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'Switzerland': 'CHF',
    'China': 'CNY',
    'Singapore': 'SGD'
  }

  return countryToCurrency[countryName] || 'USD'
}
