export type ProductColor = {
  name: string;
  hex: string;
  isSelected?: boolean;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type ProductCardData = {
  badge?: string;
  brand: string;
  name: string;
  description: string;
  exclusiveLabel?: string;
  price: string;
  compareAt: string;
  savingsLabel: string;
  rating: number;
  reviews: number;
  colors: ProductColor[];
  images: ProductImage[];
};

export const sampleProductCard: ProductCardData = {
  badge: "Black Friday Deal",
  brand: "I.N.C. International Concepts",
  name: "Women's Sweater Blazer",
  description: "Macy's Exclusive",
  exclusiveLabel: "Macy's Exclusive",
  price: "$168.27",
  compareAt: "$336.55",
  savingsLabel: "(50% off)",
  rating: 4.5,
  reviews: 350,
  colors: [
    { name: "Ivory", hex: "#f2f2f2", isSelected: true },
    { name: "Sand", hex: "#e0c798" },
    { name: "Ink", hex: "#1d1c2b" },
  ],
  images: [
    {
      url: "https://images.macysassets.com/is/image/MCY/products/6/optimized/24630396_web.jpg?wid=900&qlt=90",
      alt: "Women's sweater blazer front view",
    },
    {
      url: "https://images.macysassets.com/is/image/MCY/products/6/optimized/24630396_alt1.jpg?wid=900&qlt=90",
      alt: "Women's sweater blazer alternate angle",
    },
  ],
};

export const productCardMocks: ProductCardData[] = [
  sampleProductCard,
  {
    badge: "Limited Time",
    brand: "Lauren Ralph Lauren",
    name: "Velvet Notch-Collar Blazer",
    description: "Evening edit",
    exclusiveLabel: "Only at Timelite",
    price: "$249.00",
    compareAt: "$329.00",
    savingsLabel: "(24% off)",
    rating: 4,
    reviews: 128,
    colors: [
      { name: "Burgundy", hex: "#5c1c32", isSelected: true },
      { name: "Midnight", hex: "#0d1627" },
    ],
    images: [
      {
        url: "https://images.macysassets.com/is/image/MCY/products/2/optimized/24370282_fpx.tif?op_sharpen=1&wid=900",
        alt: "Velvet blazer front view",
      },
      {
        url: "https://images.macysassets.com/is/image/MCY/products/2/optimized/24370282_alt1.tif?wid=900",
        alt: "Velvet blazer back view",
      },
    ],
  },
  {
    badge: "New Arrival",
    brand: "Calvin Klein",
    name: "Stretch Crepe Suit Jacket",
    description: "Workwear essential",
    exclusiveLabel: "Online Exclusive",
    price: "$189.50",
    compareAt: "$230.00",
    savingsLabel: "(18% off)",
    rating: 5,
    reviews: 54,
    colors: [
      { name: "Ivory Frost", hex: "#edeae2", isSelected: true },
      { name: "Mocha", hex: "#b78d6b" },
      { name: "Black", hex: "#101010" },
    ],
    images: [
      {
        url: "https://images.macysassets.com/is/image/MCY/products/2/optimized/23954972_fpx.tif?op_sharpen=1&wid=900",
        alt: "Crepe suit jacket",
      },
      {
        url: "https://images.macysassets.com/is/image/MCY/products/2/optimized/23954972_alt2.tif?wid=900",
        alt: "Crepe suit jacket alternate angle",
      },
    ],
  },
  {
    badge: "Black Friday Deal",
    brand: "HUGO by Hugo Boss",
    name: "Barvi2435 Slim-Fit Quilted Liner Jacket",
    description: "Modern outerwear",
    exclusiveLabel: "Only at Timelite",
    price: "$199.00",
    compareAt: "$265.00",
    savingsLabel: "(25% off)",
    rating: 4,
    reviews: 53,
    colors: [
      { name: "Navy", hex: "#1f273d", isSelected: true },
      { name: "Charcoal", hex: "#3c3d41" },
      { name: "Deep Green", hex: "#334233" },
      { name: "Sangria", hex: "#5e1f2e" },
      { name: "Stone", hex: "#cfcbc4" },
    ],
    images: [
      {
        url: "https://images.macysassets.com/is/image/MCY/products/4/optimized/24471574_fpx.tif?op_sharpen=1&wid=900",
        alt: "Slim-fit quilted liner jacket front view",
      },
      {
        url: "https://images.macysassets.com/is/image/MCY/products/4/optimized/24471574_alt1.tif?wid=900",
        alt: "Slim-fit quilted liner jacket alternative angle",
      },
    ],
  },
];
