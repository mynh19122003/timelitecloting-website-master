const usdCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdNumberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format currency in USD
 * @param value - The numeric value to format
 * @returns Formatted string with USD currency symbol
 */
export const formatCurrency = (value: number): string => usdCurrencyFormatter.format(value);

/**
 * Format numeric values using USD-style separators without the symbol
 * @param value - The numeric value to format
 * @returns Formatted string without currency symbol
 */
export const formatCurrencyValue = (value: number): string => usdNumberFormatter.format(value);

