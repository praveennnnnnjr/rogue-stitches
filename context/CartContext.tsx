"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, Product, Size } from "@/lib/types";

const STORAGE_KEY = "roguestitches_cart_v1";

interface CartContextValue {
  items: CartItem[];
  // Checkout still overlays as a modal (triggered from the /cart page) —
  // that part didn't need to become its own route. The drawer that used to
  // hold cart *contents* is gone; /cart is that now.
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  addItem: (product: Product, size: Size, quantity?: number) => void;
  removeItem: (productId: string, size: Size) => void;
  updateQuantity: (productId: string, size: Size, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable — fail silently
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, size: Size, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.size === size
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          image_url: product.image_url,
          size,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: Size) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: Size, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    isCheckoutOpen,
    openCheckout: () => setIsCheckoutOpen(true),
    closeCheckout: () => setIsCheckoutOpen(false),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
