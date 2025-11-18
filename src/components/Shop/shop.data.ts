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
    subtitle: "Discover every silhouette from our Ao Dai, suiting, bridal and evening couture lines.",
    chips: ["Highlights", "Best sellers", "New arrivals", "Limited edition"],
    filters: ["Silhouette", "Fabric", "Occasion"],
  },
  [toCategorySlug("Ao Dai")]: {
    title: "Ao Dai",
    subtitle: "Modern Ao Dai silhouettes crafted with traditional details and premium fabrics.",
    chips: ["Classic", "Modern cut", "Wedding Ao Dai", "Mix & match"],
    filters: ["Silhouette", "Fabric", "Occasion"],
  },
  [toCategorySlug("Suiting")]: {
    title: "Suiting",
    subtitle: "Tailored suits and vest sets for elevated everyday and special occasions.",
    chips: ["Business", "Ceremony", "Casual suiting", "Statement pieces"],
    filters: ["Fit", "Fabric", "Occasion"],
  },
  [toCategorySlug("Bridal Gowns")]: {
    title: "Bridal Gowns",
    subtitle: "Timeless bridal pieces for your ceremony, reception and engagement photos.",
    chips: ["Ceremony gown", "Reception dress", "Engagement", "Minimal bridal"],
    filters: ["Silhouette", "Fabric", "Train length"],
  },
  [toCategorySlug("Evening Couture")]: {
    title: "Evening Couture",
    subtitle: "Dramatic evening gowns and red‑carpet ready looks.",
    chips: ["Gala", "Cocktail", "Black tie", "Statement"],
    filters: ["Silhouette", "Embellishment", "Length"],
  },
  [toCategorySlug("Conical Hats")]: {
    title: "Conical Hats",
    subtitle: "Heritage Non La silhouettes with couture-level finishing.",
    chips: ["Mother of Pearl", "Hand-Painted", "Velvet straps", "Collectible"],
    filters: ["Fabric", "Occasion"],
  },
  [toCategorySlug("Kidswear")]: {
    title: "Kidswear",
    subtitle: "Mini ateliers for ceremonies, holidays and joyful portraits.",
    chips: ["Infant", "Toddler", "Little Muse", "Young Muse"],
    filters: ["Occasion", "Length"],
  },
  [toCategorySlug("Gift Procession Sets")]: {
    title: "Gift Procession Sets",
    subtitle: "Curated lễ vật trays, textiles and ceremonial styling services.",
    chips: ["Eight Tray", "Ten Tray", "Twelve Tray", "Concierge"],
    filters: ["Occasion", "Fabric"],
  },
};

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
        heading: "Silhouettes",
        links: ["Classic", "Modern cut", "Minimal", "Layered"],
      },
      {
        heading: "Occasions",
        links: ["Daily wear", "Engagement", "Ceremony"],
      },
    ],
    quickLinks: ["New Ao Dai", "Best sellers", "View all Ao Dai"],
    highlight: {
      eyebrow: "Signature drop",
      title: "Timelite Ao Dai Capsule",
      description: "Curated looks that blend heritage details with contemporary proportions.",
      cta: "Shop Ao Dai capsule",
    },
  },
  {
    label: "Suiting",
    categorySlug: toCategorySlug("Suiting"),
    columns: [
      {
        heading: "Categories",
        links: ["Full suits", "Vests", "Separates"],
      },
      {
        heading: "Occasions",
        links: ["Office", "Ceremony", "Black tie"],
      },
    ],
    quickLinks: ["Statement blazers", "Essential suiting", "View all suiting"],
    highlight: {
      title: "Tailored for movement",
      description: "Lightweight structures designed to stay sharp from day to night.",
    },
  },
  {
    label: "Bridal",
    categorySlug: toCategorySlug("Bridal Gowns"),
    columns: [
      {
        heading: "By moment",
        links: ["Ceremony gowns", "Reception dresses", "Engagement looks"],
      },
      {
        heading: "Details",
        links: ["Lace", "Beading", "Minimal satin"],
      },
    ],
    quickLinks: ["New bridal", "Timelite brides", "View all bridal"],
    highlight: {
      eyebrow: "Bridal studio",
      title: "Book a fitting",
      description: "Explore silhouettes with 1:1 styling support in our studio.",
      cta: "Explore bridal",
    },
  },
  {
    label: "Evening",
    categorySlug: toCategorySlug("Evening Couture"),
    columns: [
      {
        heading: "Silhouettes",
        links: ["Column", "Mermaid", "A‑line", "Mini"],
      },
      {
        heading: "Occasions",
        links: ["Gala", "Cocktail", "Black tie"],
      },
    ],
    quickLinks: ["New evening", "Embellished gowns", "View all evening"],
    highlight: {
      title: "Evening edit",
      description: "Statement pieces with sculpted lines and hand‑finished details.",
    },
  },
  {
    label: "Conical Hats",
    categorySlug: toCategorySlug("Conical Hats"),
    columns: [
      {
        heading: "Editions",
        links: ["Mother of Pearl", "Hand-Painted", "Lacquered"],
      },
      {
        heading: "Straps",
        links: ["Velvet Ribbon", "Pearl Garland", "Silk Twist"],
      },
      {
        heading: "Pair With",
        links: ["Heritage Ao Dai", "Modern Suit", "Editorial Looks"],
      },
    ],
    quickLinks: ["Custom Engraving", "Collector Sets"],
  },
  {
    label: "Kidswear",
    categorySlug: toCategorySlug("Kidswear"),
    columns: [
      {
        heading: "By Age",
        links: ["Infant", "Toddler", "Little Muse (6-10)", "Young Muse (11-14)"],
      },
      {
        heading: "Storylines",
        links: ["Festive Bloom", "Mini Maestro", "Garden Party"],
      },
      {
        heading: "Gifting",
        links: ["Keepsake Boxes", "Accessories", "Sibling Sets"],
      },
    ],
    highlight: {
      eyebrow: "Mini Atelier",
      title: "Custom Sibling Sets",
      description: "Coordinated looks tailored for modern family celebrations.",
      cta: "Plan styling",
    },
  },
  {
    label: "Gift Procession Sets",
    categorySlug: toCategorySlug("Gift Procession Sets"),
    columns: [
      {
        heading: "Sets",
        links: ["Eight Tray", "Ten Tray", "Twelve Tray"],
      },
      {
        heading: "Textures",
        links: ["Velvet", "Mother of Pearl", "Bamboo Inlay"],
      },
      {
        heading: "Services",
        links: ["Styling Crew", "Custom Engraving", "Venue Logistics"],
      },
    ],
    highlight: {
      eyebrow: "Concierge Team",
      title: "Complete Planning",
      description: "Full procession styling and logistics for celebrations worldwide.",
      cta: "Meet the team",
    },
  },
];


