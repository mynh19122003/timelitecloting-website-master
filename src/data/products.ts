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

export const products: Product[] = [
  {
    id: "ao-dai-regal-crimson",
    name: "Regal Crimson Ao Dai",
    category: "ao-dai",
    shortDescription:
      "Crimson silk ao dai with hand-embroidered phoenix details, created for modern wedding ceremonies.",
    description:
      "Regal Crimson is crafted from Nha Xa mulberry silk and finished with hand-embroidered phoenix motifs that honor Vietnamese heritage. A sheer organza overlayer softens the profile while the tailored fit is calibrated for Western proportions.",
    price: 1890,
    originalPrice: 2190,
    colors: ["Crimson", "Champagne", "Ivory"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "/images/image_2.png",
  gallery: ["/images/banner.png", "/images/banner.png", "/images/image_1.png"],
    rating: 4.9,
    reviews: 62,
    tags: ["bridal", "luxury", "limited"],
    isFeatured: true,
  },
  {
    id: "ao-dai-heritage-gold",
    name: "Heritage Gold Ao Dai",
    category: "ao-dai",
    shortDescription:
      "Golden satin ao dai framed with French lace, designed for black-tie celebrations.",
    description:
      "Heritage Gold pairs French lace with luminous satin and Swarovski beadwork to deliver a couture glow under evening lights. Raglan sleeves encourage fluid movement, making it ideal for receptions and red-carpet entrances.",
    price: 1790,
    originalPrice: 1950,
    colors: ["Gold", "Pearl", "Rose"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "/images/image_1.png",
    gallery: ["/images/banner2.png", "/images/image_2.png", "/images/image_3.png"],
    rating: 4.8,
    reviews: 48,
    tags: ["evening", "best-seller"],
    isFeatured: true,
  },
  {
    id: "ao-dai-silk-ivory",
    name: "Silk Ivory Ao Dai",
    category: "ao-dai",
    shortDescription:
      "Minimal ivory ao dai with architectural seams tailored for contemporary executives.",
    description:
      "Silk Ivory focuses on clean lines and a sculpted fit achieved through couture interior construction. Italian satin drapes elegantly while the streamlined collar keeps the look current for corporate galas and cultural moments.",
    price: 1260,
    colors: ["Ivory", "Mist Blue", "Emerald"],
    sizes: ["XS", "S", "M", "L"],
    image: "/images/image_4.png",
    gallery: ["/images/image_4.png", "/images/image_5.png"],
    rating: 4.7,
    reviews: 31,
    tags: ["minimal", "work"],
    isFeatured: true,
  },
  {
    id: "vest-silk-noir",
    name: "Silk Noir Vest Suit",
    category: "vest",
    shortDescription:
      "Black satin longline vest suit with gold buttons for fashion-forward brides and hosts.",
    description:
      "Silk Noir features a lightly structured jacket with soft shoulders and premium Italian satin for a refined matte shine. Couture interior finishing keeps the silhouette sharp while allowing effortless movement all evening long.",
    price: 980,
    colors: ["Black", "Emerald", "Ruby"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "/images/image_6.png",
    gallery: ["/images/image_6.png", "/images/image_2.png"],
    rating: 4.6,
    reviews: 27,
    tags: ["modern", "evening"],
  },
  {
    id: "vest-cream-tailored",
    name: "Cream Tailored Vest",
    category: "vest",
    shortDescription:
      "Champagne tailored vest set with culotte trousers for cocktail-ready polish.",
    description:
      "The Cream Tailored Vest blends champagne suiting with architectural darts to accentuate the waist. A breathable wool-blend keeps you comfortable from ceremony to after-party, while cropped culotte trousers add modern ease.",
    price: 890,
    colors: ["Champagne", "Navy", "Stone"],
    sizes: ["XS", "S", "M", "L"],
    image: "/images/image_6.png",
    gallery: ["/images/banner.png", "/images/image_3.png"],
    rating: 4.5,
    reviews: 19,
    tags: ["business", "signature"],
  },
  {
    id: "wedding-lotus-bloom",
    name: "Lotus Bloom Bridal Gown",
    category: "wedding",
    shortDescription:
      "Multi-layer organza bridal gown inspired by lotus petals with crystal embellishment.",
    description:
      "Lotus Bloom combines a sheer corseted bodice with layered organza panels that mimic floating lotus petals. Hand-applied crystals create a gentle shimmer for ballroom and garden ceremonies alike.",
    price: 2980,
    originalPrice: 3290,
    colors: ["Pearl", "Blush", "Champagne"],
    sizes: ["S", "M", "L"],
    image: "/images/image_6.png",
    gallery: ["/images/image_1.png", "/images/image_5.png"],
    rating: 4.9,
    reviews: 54,
    tags: ["bridal", "couture"],
    isNew: true,
  },
  {
    id: "wedding-aurora",
    name: "Aurora Silk Wedding Ao Dai",
    category: "wedding",
    shortDescription:
      "White silk ao dai with detachable cape for elegant ceremonies across the United States.",
    description:
      "Aurora delivers a luminous silk base accompanied by a detachable illusion cape trimmed in freshwater pearls. The modular design transitions easily from church aisle to rooftop celebration.",
    price: 2450,
    colors: ["Ivory", "Mocha", "Rose"],
    sizes: ["XS", "S", "M", "L"],
    image: "/images/image_5.png",
    gallery: ["/images/image_5.png", "/images/image_3.png"],
    rating: 4.8,
    reviews: 43,
    tags: ["bridal", "limited"],
  },
  {
    id: "evening-starlight",
    name: "Starlight Evening Gown",
    category: "evening",
    shortDescription:
      "High-slit evening gown with hand-set sequins that capture every flash on the gala carpet.",
    description:
      "Starlight is built on a fine mesh base layered with hand-applied sequins forming a constellation effect. The column silhouette elongates the figure while the strategic slit ensures comfortable strides on stage or red carpet.",
    price: 1650,
    colors: ["Black Gold", "Emerald", "Sapphire"],
    sizes: ["XS", "S", "M", "L"],
    image: "/images/image_2.png",
    gallery: ["/images/image_2.png", "/images/image_6.png"],
    rating: 4.7,
    reviews: 36,
    tags: ["evening", "best-seller"],
  },
  {
    id: "evening-lumina",
    name: "Lumina Velvet Gown",
    category: "evening",
    shortDescription:
      "Burgundy velvet boat-neck gown finished with a sculpted champagne-gold belt.",
    description:
      "Lumina hugs the body in Italian velvet, balancing sensual draping with a structured belt dipped in champagne gold. The gown is a natural choice for holiday galas and black-tie charity events.",
    price: 1380,
    colors: ["Burgundy", "Navy", "Charcoal"],
    sizes: ["S", "M", "L"],
    image: "/images/image_4.png",
    gallery: ["/images/image_4.png", "/images/image_6.png"],
    rating: 4.6,
    reviews: 24,
    tags: ["evening", "signature"],
  },
  {
    id: "ao-dai-majestic-pearl",
    name: "Majestic Pearl Ao Dai",
    category: "ao-dai",
    shortDescription:
      "Pearl-toned ao dai with cathedral-length chiffon train celebrating Hue imperial motifs.",
    description:
      "Majestic Pearl reinterprets imperial Vietnamese patterns through champagne embroidery and pearl handwork. A detachable chiffon train creates an ethereal entrance for outdoor ceremonies and high-profile receptions.",
    price: 2050,
    colors: ["Pearl", "Gold", "Blush"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "/images/image_3.png",
    gallery: ["/images/image_3.png", "/images/image_2.png"],
    rating: 4.9,
    reviews: 58,
    tags: ["bridal", "heritage"],
  },
  {
    id: "vest-midnight-velvet",
    name: "Midnight Velvet Vest",
    category: "vest",
    shortDescription:
      "Navy velvet vest with champagne hardware inspired by the New York skyline.",
    description:
      "Midnight Velvet pairs deep navy velvet with polished gold buttons to echo city lights at dusk. The elongated cut flatters tailored trousers while remaining soft enough for extended travel and meetings.",
    price: 1120,
    colors: ["Navy", "Onyx", "Forest"],
    sizes: ["S", "M", "L", "XL"],
    image: "/images/image_6.png",
    gallery: ["/images/image_6.png", "/images/banner.png"],
    rating: 4.5,
    reviews: 22,
    tags: ["tailor-made", "evening"],
  },
  {
    id: "evening-amber",
    name: "Amber Column Dress",
    category: "evening",
    shortDescription:
      "Amber column dress with asymmetric cutouts for luminous cocktail statements.",
    description:
      "Amber Column relies on corseted construction and asymmetric cutouts to contour the body without sacrificing polish. A removable gold rope belt lets you transition seamlessly from cocktail hour to afterparty.",
    price: 1520,
    colors: ["Amber", "Jet Black", "Emerald"],
    sizes: ["XS", "S", "M", "L"],
    image: "/images/image_4.png",
    gallery: ["/images/image_4.png", "/images/image_1.png"],
    rating: 4.6,
    reviews: 30,
    tags: ["evening", "limited"],
  },
];
