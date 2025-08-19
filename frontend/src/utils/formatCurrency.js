import currency from 'currency.js';

/**
 * Currency formatting configuration for different currencies
 */
// ISO 4217 numeric currency code mapping
const NUMERIC_CURRENCY_CODES = {
  '840': 'USD',  // US Dollar
  '978': 'EUR',  // Euro
  '826': 'GBP',  // British Pound
  '392': 'JPY',  // Japanese Yen
  '784': 'AED',  // UAE Dirham
  '036': 'AUD',  // Australian Dollar
  '124': 'CAD',  // Canadian Dollar
  '156': 'CNY',  // Chinese Yuan
  '356': 'INR',  // Indian Rupee
  '756': 'CHF',  // Swiss Franc
  '752': 'SEK',  // Swedish Krona
  '578': 'NOK',  // Norwegian Krone
  '344': 'HKD',  // Hong Kong Dollar
  '702': 'SGD',  // Singapore Dollar
  '410': 'KRW',  // South Korean Won
  '682': 'SAR',  // Saudi Riyal
  '554': 'NZD',  // New Zealand Dollar
  '986': 'BRL',  // Brazilian Real
  '710': 'ZAR',  // South African Rand
  '484': 'MXN',  // Mexican Peso
  '586': 'PKR'   // Pakistani Rupee
};

const CURRENCY_CONFIG = {
  // North America
  USD: { symbol: '$', precision: 2, pattern: '!#', separator: ',', decimal: '.' },     // US Dollar
  CAD: { symbol: 'C$', precision: 2, pattern: '!#', separator: ',', decimal: '.' },    // Canadian Dollar
  MXN: { symbol: 'MX$', precision: 2, pattern: '!#', separator: ',', decimal: '.' },   // Mexican Peso

  // Europe
  EUR: { symbol: '€', precision: 2, pattern: '# !', separator: '.', decimal: ',' },    // Euro
  GBP: { symbol: '£', precision: 2, pattern: '!#', separator: ',', decimal: '.' },     // British Pound
  CHF: { symbol: 'Fr', precision: 2, pattern: '# !', separator: "'", decimal: '.' },   // Swiss Franc
  SEK: { symbol: 'kr', precision: 2, pattern: '# !', separator: ' ', decimal: ',' },   // Swedish Krona
  NOK: { symbol: 'kr', precision: 2, pattern: '# !', separator: ' ', decimal: ',' },   // Norwegian Krone

  // Asia
  JPY: { symbol: '¥', precision: 0, pattern: '!#', separator: ',', decimal: '.' },     // Japanese Yen
  CNY: { symbol: '¥', precision: 2, pattern: '!#', separator: ',', decimal: '.' },     // Chinese Yuan
  HKD: { symbol: 'HK$', precision: 2, pattern: '!#', separator: ',', decimal: '.' },   // Hong Kong Dollar
  SGD: { symbol: 'S$', precision: 2, pattern: '!#', separator: ',', decimal: '.' },    // Singapore Dollar
  KRW: { symbol: '₩', precision: 0, pattern: '!#', separator: ',', decimal: '.' },     // South Korean Won

  // Middle East
  AED: { symbol: 'د.إ', precision: 2, pattern: '# !', separator: ',', decimal: '.' },  // UAE Dirham
  SAR: { symbol: '﷼', precision: 2, pattern: '# !', separator: ',', decimal: '.' },    // Saudi Riyal

  // Oceania
  AUD: { symbol: 'A$', precision: 2, pattern: '!#', separator: ',', decimal: '.' },    // Australian Dollar
  NZD: { symbol: 'NZ$', precision: 2, pattern: '!#', separator: ',', decimal: '.' },   // New Zealand Dollar

  // Other Major Currencies
  INR: { symbol: '₹', precision: 2, pattern: '!#', separator: ',', decimal: '.' },     // Indian Rupee
  BRL: { symbol: 'R$', precision: 2, pattern: '!#', separator: '.', decimal: ',' },    // Brazilian Real
  ZAR: { symbol: 'R', precision: 2, pattern: '!#', separator: ',', decimal: '.' },     // South African Rand
  PKR: { symbol: '₨', precision: 2, pattern: '!#', separator: ',', decimal: '.' }      // Pakistani Rupee
};

/**
 * Format an amount with its currency using proper currency handling
 * @param {number|string} amount - The amount to format
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'EUR')
 * @returns {string} Formatted amount with currency
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  try {
    // Convert numeric currency code to alphabetic code
    const alphabeticCode = NUMERIC_CURRENCY_CODES[currencyCode] || currencyCode;
    
    // Handle string inputs that might include currency codes
    const numericAmount = typeof amount === 'string'
      ? parseFloat(amount.split(' ')[0])
      : amount;

    // Get currency configuration or use defaults
    const config = CURRENCY_CONFIG[alphabeticCode] || {
      symbol: alphabeticCode,
      precision: 2,
      pattern: '# !',
      separator: ',',
      decimal: '.'
    };

    // Create currency instance with proper configuration
    const value = currency(numericAmount, {
      symbol: config.symbol,
      precision: config.precision,
      pattern: config.pattern,
      separator: config.separator,
      decimal: config.decimal
    });

    return value.format();
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} ${currencyCode}`;
  }
};

/**
 * Parse a currency string or number into a currency object
 * Useful for calculations
 */
export const parseCurrency = (amount, currencyCode = 'USD') => {
  try {
    const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
    return currency(amount, config);
  } catch (error) {
    console.error('Error parsing currency:', error);
    return currency(0);
  }
};

export default formatCurrency;
