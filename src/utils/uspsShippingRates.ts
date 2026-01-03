/**
 * USPS Priority Mail Flat Rate Box Shipping Calculator
 * Simplified pricing based on item count
 */

export interface ShippingCalculationResult {
  totalPrice: number;
  estimatedDays: string;
  displayName: string;
}

/**
 * Calculate USPS Flat Rate shipping based on total item quantity
 * - 1-4 items: $12.60
 * - 5-8 items: $21.95
 * - 9-12 items: $31.40
 */
export function calculateUSPSShipping(totalItemCount: number): ShippingCalculationResult {
  if (totalItemCount <= 0) {
    return {
      totalPrice: 0,
      estimatedDays: '',
      displayName: 'No items',
    };
  }

  let totalPrice: number;
  let boxType: string;

  if (totalItemCount >= 1 && totalItemCount <= 4) {
    totalPrice = 12.60;
    boxType = 'Small Flat Rate Box';
  } else if (totalItemCount >= 5 && totalItemCount <= 8) {
    totalPrice = 21.95;
    boxType = 'Medium Flat Rate Box';
  } else if (totalItemCount >= 9 && totalItemCount <= 12) {
    totalPrice = 31.40;
    boxType = 'Large Flat Rate Box';
  } else {
    // More than 12 items - use large box price (you may want to adjust this)
    totalPrice = 31.40;
    boxType = 'Large Flat Rate Box';
  }

  return {
    totalPrice,
    estimatedDays: '4-5 business days',
    displayName: `Priority Mail ${boxType}`,
  };
}
