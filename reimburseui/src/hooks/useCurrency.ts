import { useState, useEffect, useCallback } from 'react';
import { fetchExchangeRates, convertCurrency, formatCurrency, ExchangeRates } from '@/lib/api/exchangeRates';
import { fetchCountries, CountryOption } from '@/lib/api/countries';

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  rate: number;
  lastUpdated: Date;
}

export function useCurrency() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load countries data
  const loadCountries = useCallback(async () => {
    try {
      setLoading(true);
      const countriesData = await fetchCountries();
      setCountries(countriesData);
    } catch (err) {
      setError('Failed to load countries data');
      console.error('Error loading countries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load exchange rates
  const loadExchangeRates = useCallback(async (baseCurrency: string = 'USD') => {
    try {
      setLoading(true);
      const rates = await fetchExchangeRates(baseCurrency);
      setExchangeRates(rates);
    } catch (err) {
      setError('Failed to load exchange rates');
      console.error('Error loading exchange rates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert currency
  const convert = useCallback(async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion> => {
    try {
      const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);
      const rate = await getExchangeRate(fromCurrency, toCurrency);
      
      return {
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount,
        rate,
        lastUpdated: new Date()
      };
    } catch (err) {
      throw new Error(`Failed to convert currency: ${err}`);
    }
  }, []);

  // Get exchange rate between two currencies
  const getExchangeRate = useCallback(async (fromCurrency: string, toCurrency: string): Promise<number> => {
    if (fromCurrency === toCurrency) return 1;
    
    try {
      const rates = await fetchExchangeRates(fromCurrency);
      return rates.rates[toCurrency] || 1;
    } catch (err) {
      console.error('Error getting exchange rate:', err);
      return 1;
    }
  }, []);

  // Format currency amount
  const format = useCallback((amount: number, currency: string, locale?: string): string => {
    return formatCurrency(amount, currency, locale);
  }, []);

  // Get currency for country
  const getCurrencyForCountry = useCallback((countryName: string): string => {
    const country = countries.find(c => c.name === countryName);
    return country?.currency || 'USD';
  }, [countries]);

  // Get all available currencies
  const getAvailableCurrencies = useCallback((): string[] => {
    const currencies = new Set(countries.map(c => c.currency));
    return Array.from(currencies).sort();
  }, [countries]);

  // Initialize on mount
  useEffect(() => {
    loadCountries();
    loadExchangeRates();
  }, [loadCountries, loadExchangeRates]);

  return {
    // Data
    exchangeRates,
    countries,
    
    // State
    loading,
    error,
    
    // Actions
    convert,
    format,
    getExchangeRate,
    getCurrencyForCountry,
    getAvailableCurrencies,
    loadExchangeRates,
    loadCountries,
    
    // Utilities
    clearError: () => setError(null)
  };
}
