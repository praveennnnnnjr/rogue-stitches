"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "roguestitches_wishlist_v1";

export interface WishlistItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image_url: string | null;
}

interface WishlistContextValue {
  items: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount. Guards against malformed/absent localStorage so a
  // corrupted value never throws — it just falls back to an empty wishlist.
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
      // storage full or unavailable (private browsing) — fail silently,
      // wishlist still works for the rest of the session
    }
  }, [items, hydrated]);

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.productId === product.id);
      if (exists) return prev.filter((i) => i.productId !== product.id);
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          image_url: product.image_url,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const totalItems = useMemo(() => items.length, [items]);

  const value: WishlistContextValue = {
    items,
    toggleWishlist,
    removeItem,
    isWishlisted,
    totalItems,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

// Real-time header count: any component that calls useWishlist() re-renders
// automatically when `items` changes (this is just React context — no
// polling, no manual refresh needed), so the Navbar badge always reflects
// the current wishlist without extra wiring.
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
