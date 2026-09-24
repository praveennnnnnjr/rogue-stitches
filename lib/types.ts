export type Size = "S" | "M" | "L" | "XL" | "XXL";

export const ALL_SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

// Strict 4-category enum — matches the `category` CHECK constraint on the
// products table (supabase/schema.sql). Every product must be one of these;
// there's no "uncategorized" escape hatch anymore.
export type CategorySlug = "shirts" | "t-shirts" | "hoodies" | "bottoms";

export interface Category {
  slug: CategorySlug;
  label: string;
}

export const CATEGORIES: Category[] = [
  { slug: "t-shirts", label: "T-Shirts" },
  { slug: "hoodies", label: "Hoodies" },
  { slug: "shirts", label: "Shirts" },
  { slug: "bottoms", label: "Bottoms" },
];

export interface Product {
  id: string;
  slug: string; // unique, url-safe — powers /product/[slug]
  title: string;
  description: string | null;
  price: number; // in INR, rupees (not paise)
  image_url: string | null;
  category: CategorySlug;
  sizes: Size[];
  in_stock: boolean;
  stock: number; // numeric stock count; in_stock is derived from stock > 0
  is_new: boolean;
  created_at?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image_url: string | null;
  size: Size;
  quantity: number;
}

export interface OrderItemSnapshot {
  productId: string;
  title: string;
  price: number;
  size: Size;
  quantity: number;
}

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Order {
  id: string;
  customer_name: string;
  mobile_number: string;
  address: string;
  pincode: string;
  items: OrderItemSnapshot[];
  total_amount: number;
  payment_status: PaymentStatus;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  created_at?: string;
}
