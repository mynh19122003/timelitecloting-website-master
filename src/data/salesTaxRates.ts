/**
 * US State Sales Tax Rates - 2025
 * Source: Tax Foundation (July 2025)
 * https://taxfoundation.org/data/all/state/2025-sales-taxes/
 * 
 * Last Updated: December 2024
 * Next Review: January 2026
 * 
 * Note: These are STATE-LEVEL rates only. 
 * Local/county/city taxes may apply additionally.
 */

export interface StateTaxRate {
  code: string;       // State abbreviation (e.g., "CA")
  name: string;       // Full state name
  rate: number;       // Tax rate as decimal (e.g., 0.0725 for 7.25%)
  displayRate: string; // Display format (e.g., "7.25%")
  hasLocalTax: boolean; // Whether local taxes may apply
  notes?: string;     // Special notes about the state
}

// States with NO sales tax
export const NO_SALES_TAX_STATES = ['AK', 'DE', 'MT', 'NH', 'OR'];

/**
 * Complete US State Sales Tax Rates - 2025
 * Rates are from Tax Foundation, effective July 1, 2025
 */
export const US_STATE_TAX_RATES: Record<string, StateTaxRate> = {
  // Alabama
  AL: { code: 'AL', name: 'Alabama', rate: 0.04, displayRate: '4.00%', hasLocalTax: true },
  
  // Alaska - No state sales tax (but locals may apply)
  AK: { code: 'AK', name: 'Alaska', rate: 0, displayRate: '0%', hasLocalTax: true, notes: 'No state sales tax, but local taxes may apply' },
  
  // Arizona
  AZ: { code: 'AZ', name: 'Arizona', rate: 0.056, displayRate: '5.60%', hasLocalTax: true },
  
  // Arkansas
  AR: { code: 'AR', name: 'Arkansas', rate: 0.065, displayRate: '6.50%', hasLocalTax: true },
  
  // California - Highest state rate
  CA: { code: 'CA', name: 'California', rate: 0.0725, displayRate: '7.25%', hasLocalTax: true, notes: 'Highest state sales tax rate in the US' },
  
  // Colorado
  CO: { code: 'CO', name: 'Colorado', rate: 0.029, displayRate: '2.90%', hasLocalTax: true },
  
  // Connecticut
  CT: { code: 'CT', name: 'Connecticut', rate: 0.0635, displayRate: '6.35%', hasLocalTax: false },
  
  // Delaware - No sales tax
  DE: { code: 'DE', name: 'Delaware', rate: 0, displayRate: '0%', hasLocalTax: false, notes: 'No sales tax' },
  
  // District of Columbia
  DC: { code: 'DC', name: 'District of Columbia', rate: 0.06, displayRate: '6.00%', hasLocalTax: false },
  
  // Florida
  FL: { code: 'FL', name: 'Florida', rate: 0.06, displayRate: '6.00%', hasLocalTax: true },
  
  // Georgia
  GA: { code: 'GA', name: 'Georgia', rate: 0.04, displayRate: '4.00%', hasLocalTax: true },
  
  // Hawaii (General Excise Tax)
  HI: { code: 'HI', name: 'Hawaii', rate: 0.04, displayRate: '4.00%', hasLocalTax: true, notes: 'General Excise Tax (GET)' },
  
  // Idaho
  ID: { code: 'ID', name: 'Idaho', rate: 0.06, displayRate: '6.00%', hasLocalTax: true },
  
  // Illinois
  IL: { code: 'IL', name: 'Illinois', rate: 0.0625, displayRate: '6.25%', hasLocalTax: true },
  
  // Indiana
  IN: { code: 'IN', name: 'Indiana', rate: 0.07, displayRate: '7.00%', hasLocalTax: false },
  
  // Iowa
  IA: { code: 'IA', name: 'Iowa', rate: 0.06, displayRate: '6.00%', hasLocalTax: true },
  
  // Kansas
  KS: { code: 'KS', name: 'Kansas', rate: 0.065, displayRate: '6.50%', hasLocalTax: true },
  
  // Kentucky
  KY: { code: 'KY', name: 'Kentucky', rate: 0.06, displayRate: '6.00%', hasLocalTax: false },
  
  // Louisiana
  LA: { code: 'LA', name: 'Louisiana', rate: 0.05, displayRate: '5.00%', hasLocalTax: true, notes: 'Rate increased from 4.45% in 2025' },
  
  // Maine
  ME: { code: 'ME', name: 'Maine', rate: 0.055, displayRate: '5.50%', hasLocalTax: false },
  
  // Maryland
  MD: { code: 'MD', name: 'Maryland', rate: 0.06, displayRate: '6.00%', hasLocalTax: false },
  
  // Massachusetts
  MA: { code: 'MA', name: 'Massachusetts', rate: 0.0625, displayRate: '6.25%', hasLocalTax: false },
  
  // Michigan
  MI: { code: 'MI', name: 'Michigan', rate: 0.06, displayRate: '6.00%', hasLocalTax: false },
  
  // Minnesota
  MN: { code: 'MN', name: 'Minnesota', rate: 0.06875, displayRate: '6.875%', hasLocalTax: true },
  
  // Mississippi
  MS: { code: 'MS', name: 'Mississippi', rate: 0.07, displayRate: '7.00%', hasLocalTax: false },
  
  // Missouri
  MO: { code: 'MO', name: 'Missouri', rate: 0.04225, displayRate: '4.225%', hasLocalTax: true },
  
  // Montana - No sales tax
  MT: { code: 'MT', name: 'Montana', rate: 0, displayRate: '0%', hasLocalTax: false, notes: 'No sales tax' },
  
  // Nebraska
  NE: { code: 'NE', name: 'Nebraska', rate: 0.055, displayRate: '5.50%', hasLocalTax: true },
  
  // Nevada
  NV: { code: 'NV', name: 'Nevada', rate: 0.0685, displayRate: '6.85%', hasLocalTax: true },
  
  // New Hampshire - No sales tax
  NH: { code: 'NH', name: 'New Hampshire', rate: 0, displayRate: '0%', hasLocalTax: false, notes: 'No sales tax' },
  
  // New Jersey
  NJ: { code: 'NJ', name: 'New Jersey', rate: 0.06625, displayRate: '6.625%', hasLocalTax: false },
  
  // New Mexico
  NM: { code: 'NM', name: 'New Mexico', rate: 0.04875, displayRate: '4.875%', hasLocalTax: true, notes: 'Gross Receipts Tax' },
  
  // New York
  NY: { code: 'NY', name: 'New York', rate: 0.04, displayRate: '4.00%', hasLocalTax: true },
  
  // North Carolina
  NC: { code: 'NC', name: 'North Carolina', rate: 0.0475, displayRate: '4.75%', hasLocalTax: true },
  
  // North Dakota
  ND: { code: 'ND', name: 'North Dakota', rate: 0.05, displayRate: '5.00%', hasLocalTax: true },
  
  // Ohio
  OH: { code: 'OH', name: 'Ohio', rate: 0.0575, displayRate: '5.75%', hasLocalTax: true },
  
  // Oklahoma
  OK: { code: 'OK', name: 'Oklahoma', rate: 0.045, displayRate: '4.50%', hasLocalTax: true },
  
  // Oregon - No sales tax
  OR: { code: 'OR', name: 'Oregon', rate: 0, displayRate: '0%', hasLocalTax: false, notes: 'No sales tax' },
  
  // Pennsylvania
  PA: { code: 'PA', name: 'Pennsylvania', rate: 0.06, displayRate: '6.00%', hasLocalTax: true },
  
  // Rhode Island
  RI: { code: 'RI', name: 'Rhode Island', rate: 0.07, displayRate: '7.00%', hasLocalTax: false },
  
  // South Carolina
  SC: { code: 'SC', name: 'South Carolina', rate: 0.06, displayRate: '6.00%', hasLocalTax: true },
  
  // South Dakota
  SD: { code: 'SD', name: 'South Dakota', rate: 0.045, displayRate: '4.50%', hasLocalTax: true },
  
  // Tennessee
  TN: { code: 'TN', name: 'Tennessee', rate: 0.07, displayRate: '7.00%', hasLocalTax: true },
  
  // Texas
  TX: { code: 'TX', name: 'Texas', rate: 0.0625, displayRate: '6.25%', hasLocalTax: true },
  
  // Utah
  UT: { code: 'UT', name: 'Utah', rate: 0.0485, displayRate: '4.85%', hasLocalTax: true },
  
  // Vermont
  VT: { code: 'VT', name: 'Vermont', rate: 0.06, displayRate: '6.00%', hasLocalTax: true },
  
  // Virginia
  VA: { code: 'VA', name: 'Virginia', rate: 0.053, displayRate: '5.30%', hasLocalTax: true },
  
  // Washington
  WA: { code: 'WA', name: 'Washington', rate: 0.065, displayRate: '6.50%', hasLocalTax: true },
  
  // West Virginia
  WV: { code: 'WV', name: 'West Virginia', rate: 0.06, displayRate: '6.00%', hasLocalTax: true },
  
  // Wisconsin
  WI: { code: 'WI', name: 'Wisconsin', rate: 0.05, displayRate: '5.00%', hasLocalTax: true },
  
  // Wyoming
  WY: { code: 'WY', name: 'Wyoming', rate: 0.04, displayRate: '4.00%', hasLocalTax: true },
};

/**
 * Canadian Province Sales Tax Rates - 2025
 * GST = 5% federal (applies to all provinces)
 * PST/HST varies by province
 */
export const CANADA_PROVINCE_TAX_RATES: Record<string, StateTaxRate> = {
  // Alberta - GST only
  AB: { code: 'AB', name: 'Alberta', rate: 0.05, displayRate: '5.00%', hasLocalTax: false, notes: 'GST only' },
  
  // British Columbia - GST + PST
  BC: { code: 'BC', name: 'British Columbia', rate: 0.12, displayRate: '12.00%', hasLocalTax: false, notes: 'GST 5% + PST 7%' },
  
  // Manitoba - GST + PST
  MB: { code: 'MB', name: 'Manitoba', rate: 0.12, displayRate: '12.00%', hasLocalTax: false, notes: 'GST 5% + PST 7%' },
  
  // New Brunswick - HST
  NB: { code: 'NB', name: 'New Brunswick', rate: 0.15, displayRate: '15.00%', hasLocalTax: false, notes: 'HST' },
  
  // Newfoundland and Labrador - HST
  NL: { code: 'NL', name: 'Newfoundland and Labrador', rate: 0.15, displayRate: '15.00%', hasLocalTax: false, notes: 'HST' },
  
  // Northwest Territories - GST only
  NT: { code: 'NT', name: 'Northwest Territories', rate: 0.05, displayRate: '5.00%', hasLocalTax: false, notes: 'GST only' },
  
  // Nova Scotia - HST
  NS: { code: 'NS', name: 'Nova Scotia', rate: 0.15, displayRate: '15.00%', hasLocalTax: false, notes: 'HST' },
  
  // Nunavut - GST only
  NU: { code: 'NU', name: 'Nunavut', rate: 0.05, displayRate: '5.00%', hasLocalTax: false, notes: 'GST only' },
  
  // Ontario - HST
  ON: { code: 'ON', name: 'Ontario', rate: 0.13, displayRate: '13.00%', hasLocalTax: false, notes: 'HST' },
  
  // Prince Edward Island - HST
  PE: { code: 'PE', name: 'Prince Edward Island', rate: 0.15, displayRate: '15.00%', hasLocalTax: false, notes: 'HST' },
  
  // Quebec - GST + QST
  QC: { code: 'QC', name: 'Quebec', rate: 0.14975, displayRate: '14.975%', hasLocalTax: false, notes: 'GST 5% + QST 9.975%' },
  
  // Saskatchewan - GST + PST
  SK: { code: 'SK', name: 'Saskatchewan', rate: 0.11, displayRate: '11.00%', hasLocalTax: false, notes: 'GST 5% + PST 6%' },
  
  // Yukon - GST only
  YT: { code: 'YT', name: 'Yukon', rate: 0.05, displayRate: '5.00%', hasLocalTax: false, notes: 'GST only' },
};

/**
 * Get tax rate for a US state
 * @param stateCode - Two-letter state code (e.g., "CA")
 * @returns StateTaxRate or null if not found
 */
export function getUSTaxRate(stateCode: string): StateTaxRate | null {
  const code = stateCode.toUpperCase().trim();
  return US_STATE_TAX_RATES[code] || null;
}

/**
 * Get tax rate for a Canadian province
 * @param provinceCode - Two-letter province code (e.g., "ON")
 * @returns StateTaxRate or null if not found
 */
export function getCanadaTaxRate(provinceCode: string): StateTaxRate | null {
  const code = provinceCode.toUpperCase().trim();
  return CANADA_PROVINCE_TAX_RATES[code] || null;
}

/**
 * Calculate sales tax amount
 * @param subtotal - The subtotal amount before tax
 * @param stateCode - Two-letter state/province code
 * @param country - "United States" or "Canada"
 * @returns Object with tax details
 */
export function calculateSalesTax(
  subtotal: number,
  stateCode: string,
  country: string = 'United States'
): {
  taxRate: number;
  taxAmount: number;
  displayRate: string;
  stateName: string;
  hasTax: boolean;
} {
  let taxInfo: StateTaxRate | null = null;
  
  if (country === 'United States' || country === 'US') {
    taxInfo = getUSTaxRate(stateCode);
  } else if (country === 'Canada' || country === 'CA') {
    taxInfo = getCanadaTaxRate(stateCode);
  }
  
  if (!taxInfo) {
    return {
      taxRate: 0,
      taxAmount: 0,
      displayRate: '0%',
      stateName: 'Unknown',
      hasTax: false,
    };
  }
  
  const taxAmount = Math.round(subtotal * taxInfo.rate * 100) / 100; // Round to 2 decimal places
  
  return {
    taxRate: taxInfo.rate,
    taxAmount,
    displayRate: taxInfo.displayRate,
    stateName: taxInfo.name,
    hasTax: taxInfo.rate > 0,
  };
}

/**
 * Get all US states sorted alphabetically
 */
export function getAllUSStates(): StateTaxRate[] {
  return Object.values(US_STATE_TAX_RATES).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all Canadian provinces sorted alphabetically
 */
export function getAllCanadaProvinces(): StateTaxRate[] {
  return Object.values(CANADA_PROVINCE_TAX_RATES).sort((a, b) => a.name.localeCompare(b.name));
}
