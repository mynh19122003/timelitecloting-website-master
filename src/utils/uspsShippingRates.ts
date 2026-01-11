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
 * Calculate shipping for a single box (up to 12 items)
 * - 1-4 items: $12.60 (Small Flat Rate Box)
 * - 5-8 items: $21.95 (Medium Flat Rate Box)
 * - 9-12 items: $31.40 (Large Flat Rate Box)
 */
function calculateBoxPrice(itemCount: number): { price: number; boxType: string } {
  if (itemCount <= 0) {
    return { price: 0, boxType: 'No items' };
  }
  if (itemCount >= 1 && itemCount <= 4) {
    return { price: 12.60, boxType: 'Small Flat Rate Box' };
  }
  if (itemCount >= 5 && itemCount <= 8) {
    return { price: 21.95, boxType: 'Medium Flat Rate Box' };
  }
  // 9-12 items
  return { price: 31.40, boxType: 'Large Flat Rate Box' };
}

/**
 * Calculate USPS Flat Rate shipping based on total item quantity
 * For more than 12 items, items are split into multiple boxes of 12,
 * and each box is priced according to the tier system.
 * 
 * Examples:
 * - 13 items = 12 ($31.40) + 1 ($12.60) = $44.00
 * - 15 items = 12 ($31.40) + 3 ($12.60) = $44.00
 * - 25 items = 12 ($31.40) + 12 ($31.40) + 1 ($12.60) = $75.40
 */
export function calculateUSPSShipping(totalItemCount: number): ShippingCalculationResult {
  if (totalItemCount <= 0) {
    return {
      totalPrice: 0,
      estimatedDays: '',
      displayName: 'No items',
    };
  }

  const MAX_ITEMS_PER_BOX = 12;
  let remainingItems = totalItemCount;
  let totalPrice = 0;
  let boxCount = 0;
  let lastBoxType = '';

  // Calculate price for each box
  while (remainingItems > 0) {
    const itemsInThisBox = Math.min(remainingItems, MAX_ITEMS_PER_BOX);
    const boxResult = calculateBoxPrice(itemsInThisBox);
    totalPrice += boxResult.price;
    lastBoxType = boxResult.boxType;
    boxCount++;
    remainingItems -= itemsInThisBox;
  }

  // Build display name
  let displayName: string;
  if (boxCount === 1) {
    displayName = `Priority Mail ${lastBoxType}`;
  } else {
    displayName = `Priority Mail (${boxCount} boxes)`;
  }

  return {
    totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
    estimatedDays: '4-5 business days',
    displayName,
  };
}
