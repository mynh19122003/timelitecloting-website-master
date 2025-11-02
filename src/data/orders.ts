export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
};

export type OrderHistoryEntry = {
  id: string;
  orderNumber: string;
  placedAt: string;
  expectedDelivery?: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const mockOrderHistory: OrderHistoryEntry[] = [
  {
    id: "order-81294",
    orderNumber: "TL-81294",
    placedAt: "2025-08-22T09:15:00.000Z",
    expectedDelivery: "2025-09-05",
    status: "processing",
    subtotal: 2780,
    shippingFee: 0,
    total: 2780,
    paymentMethod: "Visa •••• 2091",
    items: [
      {
        id: "ao-dai-regal-crimson",
        name: "Regal Crimson Ao Dai",
        image: "/images/image_2.png",
        color: "Crimson",
        size: "M",
        quantity: 1,
        price: 1890,
      },
      {
        id: "vest-cream-tailored",
        name: "Cream Tailored Vest",
        image: "/images/image_6.png",
        color: "Champagne",
        size: "S",
        quantity: 1,
        price: 890,
      },
    ],
  },
  {
    id: "order-80671",
    orderNumber: "TL-80671",
    placedAt: "2025-07-14T18:45:00.000Z",
    expectedDelivery: "2025-07-29",
    status: "shipped",
    subtotal: 2980,
    shippingFee: 0,
    total: 2980,
    paymentMethod: "Amex •••• 0045",
    items: [
      {
        id: "wedding-lotus-bloom",
        name: "Lotus Bloom Bridal Gown",
        image: "/images/image_6.png",
        color: "Pearl",
        size: "M",
        quantity: 1,
        price: 2980,
      },
    ],
  },
  {
    id: "order-79120",
    orderNumber: "TL-79120",
    placedAt: "2025-05-02T11:05:00.000Z",
    status: "delivered",
    subtotal: 3030,
    shippingFee: 25,
    total: 3055,
    paymentMethod: "Mastercard •••• 7782",
    items: [
      {
        id: "evening-starlight",
        name: "Starlight Evening Gown",
        image: "/images/image_2.png",
        color: "Black Gold",
        size: "S",
        quantity: 1,
        price: 1650,
      },
      {
        id: "ao-dai-majestic-pearl",
        name: "Majestic Pearl Ao Dai",
        image: "/images/image_3.png",
        color: "Pearl",
        size: "M",
        quantity: 1,
        price: 2050,
      },
    ],
  },
  {
    id: "order-78204",
    orderNumber: "TL-78204",
    placedAt: "2025-04-12T14:20:00.000Z",
    status: "cancelled",
    subtotal: 1890,
    shippingFee: 0,
    total: 1890,
    paymentMethod: "Visa •••• 8612",
    items: [
      {
        id: "ao-dai-regal-crimson",
        name: "Regal Crimson Ao Dai",
        image: "/images/image_2.png",
        color: "Champagne",
        size: "S",
        quantity: 1,
        price: 1890,
      },
    ],
  },
];
