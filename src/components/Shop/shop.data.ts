export type ShopCatalogEntry = {
  title: string;
  subtitle: string;
  chips: string[];
  filters: string[];
};

export type ShopNavHighlight = {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: string;
  note?: string;
  noteCta?: string;
};

export type ShopNavColumn = {
  heading: string;
  links: string[];
};

export type ShopNavItem = {
  label: string;
  accent?: boolean;
  disableDropdown?: boolean;
  categorySlug?: string;
  columns?: ShopNavColumn[];
  quickLinks?: string[];
  highlight?: ShopNavHighlight;
};

// Helper to normalize labels into URL-friendly slugs
export const toCategorySlug = (label: string): string => {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Default category when none is specified
export const defaultCategorySlug = "all";

const toShopPath = (slug?: string): string => {
  if (!slug || slug === defaultCategorySlug) {
    return "/shop";
  }
  return `/shop?category=${encodeURIComponent(slug)}`;
};

export const getNavItemPath = (item: ShopNavItem): string => {
  const slug = item.categorySlug ?? toCategorySlug(item.label);
  return toShopPath(slug);
};

export const shopCatalog: Record<string, ShopCatalogEntry> = {
  [defaultCategorySlug]: {
    title: "All Collections",
    subtitle: "Discover every silhouette from our couture Ao Dai, tailoring, bridal and ceremonial lines.",
    chips: ["Highlights", "Best sellers", "New arrivals", "Limited edition"],
    filters: ["Silhouette", "Fabric", "Occasion"],
  },
  [toCategorySlug("Ao Dai")]: {
    title: "Ao Dai",
    subtitle: "Modern Ao Dai silhouettes crafted with traditional details and premium fabrics.",
    chips: ["Women's Ao Dai", "Men's Ao Dai", "Family Sets", "Heritage"],
    filters: ["Silhouette", "Fabric", "Occasion"],
  },
  [toCategorySlug("Suits")]: {
    title: "Suits",
    subtitle: "Tailored suits and vest sets for ceremonies, receptions and bespoke appointments.",
    chips: ["Men’s Suits", "Women’s Suits", "Vest Sets", "Custom Orders"],
    filters: ["Fit", "Fabric", "Occasion"],
  },
  [toCategorySlug("Bridal & Formal Dresses")]: {
    title: "Bridal & Formal Dresses",
    subtitle: "From aisle to after-party, discover gowns for every celebration.",
    chips: ["Wedding", "Party & Gala", "Pageant", "Bridesmaid"],
    filters: ["Silhouette", "Embellishment", "Length"],
  },
  [toCategorySlug("Accessories")]: {
    title: "Accessories",
    subtitle: "Complete the look with heirloom hats, handbags and finishing touches.",
    chips: ["Conical Hats", "Handbags", "Sandals", "Headpieces"],
    filters: ["Material", "Occasion"],
  },
  [toCategorySlug("Kidswear")]: {
    title: "Kidswear",
    subtitle: "Mini ateliers for ceremonies, holidays and joyful portraits.",
    chips: ["Infant", "Toddler", "Little Muse", "Young Muse"],
    filters: ["Occasion", "Length"],
  },
  [toCategorySlug("Lunar New Year Décor")]: {
    title: "Lunar New Year Décor",
    subtitle: "Backdrops, blossoms and calligraphy accents for festive gatherings.",
    chips: ["Backdrops", "Mai Blossoms", "Peach Blossoms", "Lanterns"],
    filters: ["Color", "Scale"],
  },
  [toCategorySlug("Ceremonial Attire")]: {
    title: "Ceremonial Attire",
    subtitle: "Temple robes, pilgrimage sets and heritage ensembles for the entire family.",
    chips: ["Women", "Men", "Family Sets", "Heritage"],
    filters: ["Silhouette", "Occasion"],
  },
  [toCategorySlug("Uniforms & Teamwear")]: {
    title: "Uniforms & Teamwear",
    subtitle: "Coordinated looks for schools, choirs, hospitality teams and more.",
    chips: ["Schools", "Choirs", "Restaurants", "Retail"],
    filters: ["Industry", "Color"],
  },
  [toCategorySlug("Wedding Gift Trays")]: {
    title: "Wedding Gift Trays",
    subtitle: "Traditional mâm quả sets for your engagement and wedding ceremonies.",
    chips: ["Eight Tray", "Ten Tray", "Twelve Tray", "Custom Sets"],
    filters: ["Style", "Color", "Price"],
  },
};

// Legacy slug aliases for backward compatibility
shopCatalog[toCategorySlug("Suiting")] = shopCatalog[toCategorySlug("Suits")];
shopCatalog[toCategorySlug("Bridal Gowns")] = shopCatalog[toCategorySlug("Bridal & Formal Dresses")];
shopCatalog[toCategorySlug("Evening Couture")] = shopCatalog[toCategorySlug("Bridal & Formal Dresses")];
shopCatalog[toCategorySlug("Conical Hats")] = shopCatalog[toCategorySlug("Accessories")];
shopCatalog[toCategorySlug("Gift Procession Sets")] = shopCatalog[toCategorySlug("Lunar New Year Décor")];

export const shopNavMenu: ShopNavItem[] = [
  {
    label: "Shop All",
    accent: true,
    disableDropdown: true,
    categorySlug: defaultCategorySlug,
  },
  {
    label: "Ao Dai",
    categorySlug: toCategorySlug("Ao Dai"),
    columns: [
      {
        heading: "Women's Ao Dai",
        links: [
          "Bridal Ao Dai",
          "Designer Ao Dai (Women)",
          "Traditional Ao Dai (Women)",
          "Modern Ao Dai (Women)",
        ],
      },
      {
        heading: "Heritage & Family",
        links: [
          "Ceremonial Nhạc Bình (Women)",
          "Five-Panel Ao Dai (Women)",
          "Girls’ Ao Dai",
          "Mother & Daughter Sets",
        ],
      },
      {
        heading: "Men & Family",
        links: [
          "Modern Ao Dai (Men)",
          "Designer Ao Dai (Men)",
          "Five-Panel Ao Dai (Men)",
          "Ceremonial Nhạc Bình (Men)",
          "Father & Son Sets",
        ],
      },
    ],
    quickLinks: ["View all Ao Dai"],
    highlight: {
      eyebrow: "Signature drop",
      title: "Timelite Ao Dai Capsule",
      description: "Curated looks that blend heritage details with contemporary proportions.",
      cta: "Shop Ao Dai capsule",
    },
  },
  {
    label: "Suits",
    categorySlug: toCategorySlug("Suits"),
    columns: [
      {
        heading: "Tailoring",
        links: ["Men’s Suits", "Women’s Suits"],
      },
      {
        heading: "Vest Sets",
        links: ["Men’s Vests", "Women’s Vests"],
      },
    ],
    quickLinks: ["View all Suits"],
    highlight: {
      title: "Tailored for movement",
      description: "Lightweight structures designed to stay sharp from day to night.",
    },
  },
  {
    label: "Bridal & Formal Dresses",
    categorySlug: toCategorySlug("Bridal & Formal Dresses"),
    columns: [
      {
        heading: "By moment",
        links: ["Wedding Dresses", "Party & Gala Dresses"],
      },
      {
        heading: "Specialty",
        links: ["Pageant Dresses", "Bridesmaid Dresses"],
      },
    ],
    quickLinks: ["View all Bridal & Formal"],
    highlight: {
      eyebrow: "Bridal studio",
      title: "Book a fitting",
      description: "Explore silhouettes with 1:1 styling support in our studio.",
      cta: "Explore bridal",
    },
  },
  {
    label: "Accessories",
    categorySlug: toCategorySlug("Accessories"),
    columns: [
      {
        heading: "Iconic Pieces",
        links: ["Conical Hats", "Handbags & Clutches", "Wooden Sandals"],
      },
      {
        heading: "Finishing Touches",
        links: ["Statement Collars", "Traditional Turbans", "Heels & Dress Shoes"],
      },
    ],
    quickLinks: ["View all Accessories"],
  },
  {
    label: "Lunar New Year Décor",
    categorySlug: toCategorySlug("Lunar New Year Décor"),
    columns: [
      {
        heading: "Décor Highlights",
        links: ["Backdrops & Photo Walls", "Mai Blossoms", "Peach Blossoms"],
      },
      {
        heading: "Accents",
        links: ["Calligraphy Panels", "Red Envelopes", "Lanterns"],
      },
    ],
    quickLinks: ["View all Lunar Décor"],
  },
  {
    label: "Ceremonial Attire",
    categorySlug: toCategorySlug("Ceremonial Attire"),
    columns: [
      {
        heading: "Women",
        links: [
          "Temple Robes (Women)",
          "Pilgrimage Ao Dai",
          "Women’s Ba Ba Sets",
        ],
      },
      {
        heading: "Men",
        links: [
          "Temple Ao Dai (Men)",
          "Men’s Ba Ba Sets",
        ],
      },
      {
        heading: "Family Sets",
        links: [
          "Girls’ Ba Ba Sets",
          "Family Matching Sets",
        ],
      },
    ],
    quickLinks: ["View all Ceremonial Attire"],
  },
  {
    label: "Uniforms & Teamwear",
    categorySlug: toCategorySlug("Uniforms & Teamwear"),
    columns: [
      {
        heading: "Schools & Choirs",
        links: ["School Uniforms", "Choir & Church Uniforms"],
      },
      {
        heading: "Hospitality & Retail",
        links: ["Restaurant Uniforms", "Retail Uniforms"],
      },
      {
        heading: "Teams & Workshops",
        links: ["Factory & Workshop Uniforms", "Youth Team Uniforms"],
      },
    ],
    quickLinks: ["View all Uniforms"],
  },
  {
    label: "Wedding Gift Trays",
    categorySlug: toCategorySlug("Wedding Gift Trays"),
    columns: [
      {
        heading: "Trays & Sets",
        links: ["Eight Tray", "Ten Tray", "Twelve Tray"],
      },
      {
        heading: "Styles",
        links: ["Velvet", "Mother of Pearl", "Bamboo Inlay"],
      },
      {
        heading: "Services",
        links: ["Styling Crew", "Custom Engraving", "Venue Logistics"],
      },
    ],
    quickLinks: ["View all Sets"],
    highlight: {
      eyebrow: "Concierge Team",
      title: "Complete Planning",
      description: "Full procession planning and logistics for your special day.",
      cta: "Meet the team",
    },
  },
];


