import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { products } from "../data/products";

type CartItem = {
  id: string;
  productId: string;
  pid?: string; // Product ID from backend (e.g., PID00001)
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};

type AddToCartPayload = {
  productId: string;
  pid?: string; // Optional: Product ID from backend (e.g., PID00001)
  name?: string; // Optional: Product name (if not from local products)
  image?: string; // Optional: Product image (if not from local products)
  price?: number; // Optional: Product price (if not from local products)
  color: string;
  size: string;
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (payload: AddToCartPayload) => { status: "success" | "error"; message: string };
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const buildCartItemId = (payload: AddToCartPayload) =>
  [payload.productId, payload.color, payload.size].join("::").toLowerCase();

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback((payload: AddToCartPayload) => {
    // Try to find product in local products array first
    let product = products.find((item) => item.id === payload.productId);
    
    // If not found in local array, use provided data or create minimal product
    if (!product) {
      // If payload has name, price, image, use those (from API)
      if (payload.name && payload.price !== undefined && payload.image) {
        product = {
          id: payload.productId,
          pid: payload.pid,
          name: payload.name,
          image: payload.image,
          price: payload.price,
          category: "other" as any,
          shortDescription: "",
          description: "",
          colors: [],
          sizes: [],
          gallery: [],
          rating: 0,
          reviews: 0,
          tags: [],
        };
      } else {
        // Fallback: return error if no product found and no data provided
        return { status: "error" as const, message: "Product not found." };
      }
    }

    const cartItemId = buildCartItemId(payload);
    const quantity = Math.max(payload?.quantity ?? 1, 1);

    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          pid: payload.pid || product.pid,
          name: product.name,
          image: product.image,
          price: product.price,
          color: payload.color,
          size: payload.size,
          quantity,
        },
      ];
    });

    return {
      status: "success" as const,
      message: `${product.name} added to your cart.`,
    };
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: Math.max(quantity, 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const aggregates = useMemo(() => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total: aggregates.total,
      itemCount: aggregates.itemCount,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [
      addToCart,
      aggregates.itemCount,
      aggregates.total,
      clearCart,
      closeCart,
      isCartOpen,
      items,
      openCart,
      removeFromCart,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
