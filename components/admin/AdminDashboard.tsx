"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { LogOut, Plus, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  deleteOfflineProduct,
  loadOfflineProducts,
} from "@/lib/adminLocalStore";
import type { Order, PaymentStatus, Product } from "@/lib/types";
import ProductForm from "./ProductForm";
import ProductsTable from "./ProductsTable";
import OrdersTable from "./OrdersTable";

type Tab = "products" | "orders";

export default function AdminDashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  // True when Supabase couldn't be reached and we've fallen back to a
  // localStorage-backed product list so the owner can keep working.
  const [offlineMode, setOfflineMode] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts((data as Product[]) ?? []);
      setOfflineMode(false);
      setError(null);
    } catch {
      setProducts(loadOfflineProducts());
      setOfflineMode(true);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch {
      // Orders have no offline fallback yet — they simply won't load until
      // Supabase is reachable again.
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProducts(), loadOrders()]).finally(() => setLoading(false));
  }, [loadProducts, loadOrders]);

  async function handleDeleteProduct(p: Product) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;

    if (offlineMode) {
      deleteOfflineProduct(p.id);
      loadProducts();
      return;
    }

    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: p.id }),
    });
    if (res.ok) loadProducts();
  }

  async function handleStatusChange(order: Order, status: PaymentStatus) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: order.id, payment_status: status }),
    });
    if (res.ok) loadOrders();
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="flex items-center justify-between border-b border-seam px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative block h-8 w-[130px]">
            <Image src="/logo-mark.png" alt="RogueStitches" fill className="object-contain object-left" />
          </span>
          <p className="text-xs text-smoke">Admin dashboard</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 border border-seam px-3 py-2 text-xs text-smoke hover:border-oxblood2 hover:text-bone"
        >
          <LogOut size={14} />
          Log out
        </button>
      </header>

      {offlineMode && (
        <div className="flex items-center gap-2 border-b border-seam bg-panel px-4 py-2.5 text-xs text-smoke sm:px-6">
          <WifiOff size={14} className="text-oxblood2" />
          Supabase isn&apos;t reachable — showing a local product list saved
          in this browser. Fix your Supabase env vars, then reload this page
          to reconnect.
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex gap-2 border-b border-seam">
          {(["products", "orders"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-oxblood2 text-bone"
                  : "text-smoke hover:text-bone"
              }`}
            >
              {t} {t === "orders" && orders.length > 0 && `(${orders.length})`}
            </button>
          ))}
        </div>

        {error && <p className="mb-4 text-sm text-oxblood2">{error}</p>}

        {tab === "products" && (
          <div className="flex flex-col gap-5">
            {!formOpen && (
              <button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="flex w-fit items-center gap-2 bg-oxblood2 px-4 py-2.5 text-sm font-medium text-bone hover:bg-oxblood"
              >
                <Plus size={16} />
                Add Product
              </button>
            )}

            {formOpen && (
              <ProductForm
                token={token}
                product={editing}
                offlineMode={offlineMode}
                onCancel={() => setFormOpen(false)}
                onSaved={() => {
                  setFormOpen(false);
                  loadProducts();
                }}
              />
            )}

            {loading ? (
              <p className="text-sm text-smoke">Loading products…</p>
            ) : (
              <ProductsTable
                products={products}
                onEdit={(p) => {
                  setEditing(p);
                  setFormOpen(true);
                }}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>
        )}

        {tab === "orders" &&
          (loading ? (
            <p className="text-sm text-smoke">Loading orders…</p>
          ) : (
            <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
          ))}
      </div>
    </div>
  );
}
