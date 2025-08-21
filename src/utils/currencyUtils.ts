/**
 * Utility functions for Brazilian currency formatting and parsing
 */

/**
 * Formats a number to Brazilian Real currency format
 * @param value - Number to format
 * @returns Formatted currency string (e.g., "R$ 1.500,00")
 */
export const formatBrazilianCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Parses Brazilian currency string with proper format handling
 * Handles both user input and imported values consistently
 * @param input - Formatted input string
 * @returns Number value
 */
export const parseUserCurrencyInput = (input: string): number => {
  return parseBrazilianCurrency(input);
};

/**
 * Parses a Brazilian currency string to number
 * Accepts formats like: "1.500,00", "1500,50", "1.500", "1500"
 * @param value - String to parse
 * @returns Parsed number
 */
export const parseBrazilianCurrency = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove currency symbols and spaces
  let cleanValue = value
    .replace(/[R$\s]/g, '')
    .trim();
  
  // Handle Brazilian format: dots as thousand separators, comma as decimal
  // Examples: "1.500,00" -> 1500.00, "1.500" -> 1500, "500,50" -> 500.50
  
  // If there's a comma, it's the decimal separator
  if (cleanValue.includes(',')) {
    // Split by comma to separate integer and decimal parts
    const parts = cleanValue.split(',');
    if (parts.length === 2) {
      // Remove dots from integer part (thousand separators)
      const integerPart = parts[0].replace(/\./g, '');
      const decimalPart = parts[1];
      cleanValue = `${integerPart}.${decimalPart}`;
    }
  } else {
    // No comma means no decimal part
    // If there are multiple dots or the last dot is followed by 3+ digits, treat dots as thousand separators
    const dotCount = (cleanValue.match(/\./g) || []).length;
    if (dotCount > 0) {
      const lastDotIndex = cleanValue.lastIndexOf('.');
      const afterLastDot = cleanValue.substring(lastDotIndex + 1);
      
      // If there are 3+ digits after the last dot, or multiple dots, treat as thousand separator
      if (afterLastDot.length >= 3 || dotCount > 1) {
        cleanValue = cleanValue.replace(/\./g, '');
      }
      // Otherwise, treat the single dot as decimal separator (keep it)
    }
  }
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validates if a currency input string is valid
 * @param value - String to validate
 * @returns Whether the string represents a valid currency value
 */
export const validateCurrencyInput = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  
  // Remove currency symbols and spaces
  const cleanValue = value.replace(/[R$\s]/g, '').trim();
  
  // Check for valid Brazilian currency pattern
  const brazilianPattern = /^(\d{1,3}(\.\d{3})*|\d+)(,\d{1,2})?$/;
  const decimalPattern = /^\d+(\.\d{1,2})?$/;
  
  return brazilianPattern.test(cleanValue) || decimalPattern.test(cleanValue);
};

/**
 * Formats currency input for display using Brazilian standards
 * @param value - Number to format
 * @returns Formatted value for display
 */
export const formatCurrencyInput = (value: number): string => {
  return formatBrazilianCurrency(value);
};
