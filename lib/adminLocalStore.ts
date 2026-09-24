"use client";

import { MOCK_PRODUCTS } from "./mockProducts";
import type { Product } from "./types";

// Local/offline fallback for the admin dashboard: used only when the
// Supabase products table can't be reached (missing env vars, network
// down, etc.) so the owner can still add/edit/delete products and see
// those changes persist in *this browser* via localStorage. This is not a
// substitute for the real database — it's a way to keep working (and not
// lose data) while Supabase is unavailable or not set up yet.
const STORAGE_KEY = "roguestitches_admin_products_offline_v1";

function readRaw(): Product[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed storage
  }
  // seed with the same demo catalog customers see, so the admin list isn't
  // empty the first time offline mode kicks in
  const seeded = MOCK_PRODUCTS.map((p) => ({ ...p }));
  writeRaw(seeded);
  return seeded;
}

function writeRaw(products: Product[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function loadOfflineProducts(): Product[] {
  return readRaw();
}

export function addOfflineProduct(
  fields: Omit<Product, "id" | "created_at">
): Product {
  const products = readRaw();
  const newProduct: Product = {
    ...fields,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  const updated = [newProduct, ...products];
  writeRaw(updated);
  return newProduct;
}

export function updateOfflineProduct(
  id: string,
  fields: Partial<Product>
): Product | null {
  const products = readRaw();
  let updatedProduct: Product | null = null;
  const updated = products.map((p) => {
    if (p.id !== id) return p;
    updatedProduct = { ...p, ...fields };
    return updatedProduct;
  });
  writeRaw(updated);
  return updatedProduct;
}

export function deleteOfflineProduct(id: string): void {
  const products = readRaw().filter((p) => p.id !== id);
  writeRaw(products);
}
