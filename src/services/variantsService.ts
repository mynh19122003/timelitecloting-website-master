/**
 * Variants Service
 * Fetches variants from API (no localStorage caching - hosting handles caching)
 */

import { API_CONFIG } from '../config/api';

export type VariantsByCategory = Record<string, string[]>;

/**
 * Default hardcoded variants as ultimate fallback when API fails
 */
export const DEFAULT_VARIANTS_BY_CATEGORY: VariantsByCategory = {
  "ao-dai": [
    "Bridal Ao Dai",
    "Designer Ao Dai (Women)",
    "Traditional Ao Dai (Women)",
    "Modern Ao Dai (Women)",
    "Ceremonial Nhật Bình (Women)",
    "Five-Panel Ao Dai (Women)",
    "Girls' Ao Dai",
    "Boys Ao Dai",
    "Mother & Daughter Matching Ao Dai",
    "Modern Ao Dai (Men)",
    "Designer Ao Dai (Men)",
    "Five-Panel Ao Dai (Men)",
    "Ceremonial Nhật Bình (Men)",
    "Father & Son Matching Ao Dai",
  ],
  "suits": ["Men's Suits", "Women's Suits"],
  "bridal-formal-dresses": [
    "Wedding Dresses",
    "Party & Gala Dresses",
    "Pageant Dresses",
    "Bridesmaid Dresses",
  ],
  "accessories": [
    "Conical Hats",
    "Evening Bags & Clutches",
    "Wooden Sandals",
    "Statement Collars",
    "Traditional Turbans",
    "Heels & Dress Shoes",
  ],
  "lunar-new-year-decor": [
    "Backdrops & Photo Walls",
    "Yellow Mai Blossoms",
    "Peach Blossoms",
    "Calligraphy Panels",
    "Red Envelopes",
    "Lanterns",
  ],
  "ceremonial-attire": [
    "Ceremonial Nhật Bình (Women)",
    "Ceremonial Nhật Bình (Men)",
    "Women's Temple Robes",
    "Women's Pilgrimage Ao Dai",
    "Women's 'Ba Ba' Sets",
    "Girls' 'Ba Ba' Sets",
    "Men's Casual 'Ba Ba'",
    "Men's 'Ba Ba' Sets",
    "Men's Temple Ao Dai",
  ],
  "uniforms-teamwear": [
    "School Uniforms",
    "Choir & Church Uniforms",
    "Youth Group / Team Uniforms",
    "Restaurant Uniforms",
    "Retail Uniforms",
    "Factory & Workshop Uniforms",
    "Student Uniforms",
  ],
};

/**
 * Fetch variants from API
 */
const fetchVariantsFromApi = async (): Promise<VariantsByCategory | null> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/php/products/variants-grouped`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const json = await response.json();
    
    if (json.success && json.data?.variantsByCategory) {
      return json.data.variantsByCategory as VariantsByCategory;
    }
    
    return null;
  } catch (error) {
    console.warn('[variantsService] Failed to fetch variants from API:', error);
    return null;
  }
};

/**
 * Get variants by category
 * Always fetches from API, falls back to hardcoded defaults on error
 */
export const getVariantsByCategory = async (): Promise<VariantsByCategory> => {
  const apiData = await fetchVariantsFromApi();
  
  if (apiData && Object.keys(apiData).length > 0) {
    console.log('[variantsService] Using API variants');
    return apiData;
  }
  
  // Fallback to hardcoded defaults
  console.log('[variantsService] API failed, using hardcoded defaults');
  return DEFAULT_VARIANTS_BY_CATEGORY;
};

/**
 * Get variants for a specific category slug
 */
export const getVariantsForCategory = async (categorySlug: string): Promise<string[]> => {
  const allVariants = await getVariantsByCategory();
  return allVariants[categorySlug] || [];
};

/**
 * Sync version for immediate use (returns default)
 */
export const getVariantsByCategorySync = (): VariantsByCategory => {
  return DEFAULT_VARIANTS_BY_CATEGORY;
};

/**
 * No-op function for backwards compatibility
 * Cache is no longer used, hosting handles caching
 */
export const invalidateVariantsCache = (): void => {
  console.log('[variantsService] Cache invalidation - no local cache to clear');
};
