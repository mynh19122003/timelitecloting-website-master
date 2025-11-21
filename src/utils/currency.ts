/**
 * Format currency in VND (Vietnamese Dong)
 * @param value - The numeric value to format
 * @returns Formatted string with VND currency
 */
export const formatCurrency = (value: number): string => {
  // Round to integer (VND doesn't use decimals)
  const roundedValue = Math.round(value);
  // Format with Vietnamese locale (uses dots as thousand separators)
  return `${roundedValue.toLocaleString("vi-VN", { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })} VNĐ`;
};

/**
 * Format currency without the VND suffix (for cases where you want to add it separately)
 * @param value - The numeric value to format
 * @returns Formatted string without currency symbol
 */
export const formatCurrencyValue = (value: number): string => {
  // Round to integer (VND doesn't use decimals)
  const roundedValue = Math.round(value);
  return roundedValue.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

