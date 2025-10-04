// Exchange Rate API service
export interface ExchangeRates {
  base: string;
  date: string;
  rates: {
    [currency: string]: number;
  };
}

// Cache for exchange rates
const ratesCache = new Map<string, { data: ExchangeRates; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
  // Check cache first
  const cached = ratesCache.get(baseCurrency);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ExchangeRates = await response.json();
    
    // Cache the result
    ratesCache.set(baseCurrency, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback data if API fails
    return getFallbackRates(baseCurrency);
  }
}

// Fallback exchange rates in case API fails
function getFallbackRates(baseCurrency: string): ExchangeRates {
  const fallbackRates: { [key: string]: { [key: string]: number } } = {
    USD: {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      INR: 83.0,
      CAD: 1.35,
      AUD: 1.50,
      JPY: 110.0,
      CNY: 6.45,
      BRL: 5.20,
      MXN: 20.0
    },
    EUR: {
      USD: 1.18,
      EUR: 1,
      GBP: 0.86,
      INR: 97.5,
      CAD: 1.59,
      AUD: 1.76,
      JPY: 129.4,
      CNY: 7.59,
      BRL: 6.12,
      MXN: 23.5
    },
    GBP: {
      USD: 1.37,
      EUR: 1.16,
      GBP: 1,
      INR: 113.4,
      CAD: 1.85,
      AUD: 2.05,
      JPY: 150.7,
      CNY: 8.84,
      BRL: 7.12,
      MXN: 27.4
    }
  };

  return {
    base: baseCurrency,
    date: new Date().toISOString().split('T')[0],
    rates: fallbackRates[baseCurrency] || { [baseCurrency]: 1 }
  };
}

// Convert amount from one currency to another
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }
    
    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount; // Return original amount if conversion fails
  }
}

// Get exchange rate between two currencies
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }
    
    return rate;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return 1; // Return 1 if rate not found
  }
}

// Format currency amount with proper symbol and formatting
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    BRL: 'R$',
    MXN: '$'
  };

  const symbol = currencySymbols[currency] || currency;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    return `${symbol}${amount.toFixed(2)}`;
  }
}
