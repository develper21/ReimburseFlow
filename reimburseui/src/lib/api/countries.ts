// REST Countries API service
export interface Country {
  name: {
    common: string;
    official: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

export interface CountryOption {
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
}

// Cache for countries data
let countriesCache: CountryOption[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchCountries(): Promise<CountryOption[]> {
  // Return cached data if still valid
  if (countriesCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return countriesCache;
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const countries: Country[] = await response.json();
    
    // Transform the data into a more usable format
    const countryOptions: CountryOption[] = countries
      .filter(country => country.currencies && Object.keys(country.currencies).length > 0)
      .map(country => {
        const currencyCode = Object.keys(country.currencies)[0];
        const currency = country.currencies[currencyCode];
        
        return {
          name: country.name.common,
          code: country.name.common, // Using common name as code for simplicity
          currency: currencyCode,
          currencySymbol: currency.symbol || currencyCode
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Cache the results
    countriesCache = countryOptions;
    cacheTimestamp = Date.now();
    
    return countryOptions;
  } catch (error) {
    console.error('Error fetching countries:', error);
    
    // Return fallback data if API fails
    return getFallbackCountries();
  }
}

// Fallback countries data in case API fails
function getFallbackCountries(): CountryOption[] {
  return [
    { name: 'United States', code: 'US', currency: 'USD', currencySymbol: '$' },
    { name: 'United Kingdom', code: 'GB', currency: 'GBP', currencySymbol: '£' },
    { name: 'European Union', code: 'EU', currency: 'EUR', currencySymbol: '€' },
    { name: 'India', code: 'IN', currency: 'INR', currencySymbol: '₹' },
    { name: 'Canada', code: 'CA', currency: 'CAD', currencySymbol: 'C$' },
    { name: 'Australia', code: 'AU', currency: 'AUD', currencySymbol: 'A$' },
    { name: 'Japan', code: 'JP', currency: 'JPY', currencySymbol: '¥' },
    { name: 'China', code: 'CN', currency: 'CNY', currencySymbol: '¥' },
    { name: 'Brazil', code: 'BR', currency: 'BRL', currencySymbol: 'R$' },
    { name: 'Mexico', code: 'MX', currency: 'MXN', currencySymbol: '$' },
  ];
}

// Get currency for a specific country
export async function getCurrencyForCountry(countryName: string): Promise<string> {
  const countries = await fetchCountries();
  const country = countries.find(c => c.name === countryName);
  return country?.currency || 'USD';
}

// Get all available currencies
export async function getAvailableCurrencies(): Promise<string[]> {
  const countries = await fetchCountries();
  const currencies = new Set(countries.map(c => c.currency));
  return Array.from(currencies).sort();
}
