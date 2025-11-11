export type Category = "ao-dai" | "vest" | "wedding" | "evening";
export type ProductCategory = Category; // Alias for backward compatibility

export type Product = {
  id: string;
  pid?: string; // Product ID from backend (e.g., PID00001)
  name: string;
  category: Category;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  colors: string[];
  sizes: Array<"XS" | "S" | "M" | "L" | "XL">;
  image: string;
  gallery: string[];
  rating: number;
  reviews: number;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
};

// Map frontend string IDs to backend numeric IDs
// This is needed because backend database uses INT product_id
export const productIdMap: Record<string, number> = {
  "ao-dai-regal-crimson": 1,
  "ao-dai-heritage-gold": 2,
  "ao-dai-majestic-pearl": 3,
  "ao-dai-azure-moon": 4,
  "vest-executive-navy": 5,
  "vest-sovereign-charcoal": 6,
  "vest-diplomat-ivory": 7,
  "vest-maverick-pinstripe": 8,
  "wedding-eternal-grace": 9,
  "wedding-celestial-dream": 10,
  "wedding-royal-elegance": 11,
  "wedding-divine-silk": 12,
  "evening-midnight-glamour": 13,
  "evening-scarlet-empress": 14,
  "evening-champagne-luxe": 15,
  "evening-emerald-night": 16,
};

export const categoryLabels: Record<Category, string> = {
  "ao-dai": "Ao Dai Couture",
  vest: "Tailored Suiting",
  wedding: "Bridal Gowns",
  evening: "Evening Dresses",
};

// Reverse mapping: category label (from API) -> category slug (frontend)
export const categoryLabelToSlug: Record<string, Category> = {
  "Ao Dai Couture": "ao-dai",
  "Tailored Suiting": "vest",
  "Bridal Gowns": "wedding",
  "Evening Dresses": "evening",
  // Also support common variations
  "ao-dai": "ao-dai",
  "vest": "vest",
  "wedding": "wedding",
  "evening": "evening",
};

// Category keywords for fuzzy matching (ordered by priority: longer/more specific first)
const categoryKeywords: Record<Category, string[]> = {
  "wedding": ["bridal gown", "bridal gowns", "wedding gown", "wedding gowns", "bridal", "wedding"],
  "evening": ["evening dress", "evening dresses", "evening"],
  "ao-dai": ["ao dai", "ao-dai", "aodai"],
  "vest": ["tailored suiting", "suiting", "tailored", "vest"],
};

// Helper function to normalize category from API to frontend slug
export function normalizeCategory(category: string | null | undefined): Category | "other" {
  if (!category) return "other";
  
  // Normalize: trim, collapse whitespace, remove extra spaces
  const normalized = category.trim().replace(/\s+/g, " ");
  
  // Check exact match first (case-insensitive)
  const lower = normalized.toLowerCase();
  for (const [label, slug] of Object.entries(categoryLabelToSlug)) {
    if (label.toLowerCase() === lower) {
      return slug as Category;
    }
  }
  
  // Check if it's already a slug
  if (normalized.toLowerCase() in categoryLabelToSlug) {
    return categoryLabelToSlug[normalized.toLowerCase()] as Category;
  }
  
  // Fuzzy match: check if category contains keywords (longer keywords first for better matching)
  const lowerCategory = normalized.toLowerCase();
  
  // Sort categories by keyword length (longer = more specific = higher priority)
  const categoryEntries = Object.entries(categoryKeywords) as [Category, string[]][];
  
  // Find the best match by checking longest keywords first
  let bestMatch: Category | null = null;
  let bestMatchLength = 0;
  
  for (const [slug, keywords] of categoryEntries) {
    for (const keyword of keywords) {
      if (lowerCategory.includes(keyword.toLowerCase()) && keyword.length > bestMatchLength) {
        bestMatch = slug;
        bestMatchLength = keyword.length;
      }
    }
  }
  
  if (bestMatch) {
    return bestMatch;
  }
  
  return "other";
}

// Removed mock `products` export to avoid using static data on Shop page.
