import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// Removed mock products import

export type CartItem = {
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

export type AddToCartPayload = {
  productId: string;
  pid?: string; // Optional: Product ID from backend (e.g., PID00001)
  name: string; // Product name from API/UI
  image: string; // Product image from API/UI
  price: number; // Product price from API/UI
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
    // Validate minimal product data (comes from UI/API)
    if (!payload.name || payload.price === undefined || !payload.image) {
      return { status: "error" as const, message: "Invalid product data." };
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
          productId: payload.productId,
          pid: payload.pid,
          name: payload.name,
          image: payload.image,
          price: payload.price,
          color: payload.color,
          size: payload.size,
          quantity,
        },
      ];
    });

    return {
      status: "success" as const,
      message: `${payload.name} added to your cart.`,
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
