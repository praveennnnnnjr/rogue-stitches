"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";

export default function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="border border-seam bg-panel p-10 text-center text-sm text-smoke">
        No products yet. Add your first one above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-seam">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-seam bg-panel text-left text-xs text-smoke">
            <th className="px-4 py-3 font-normal">Product</th>
            <th className="px-4 py-3 font-normal">Price</th>
            <th className="px-4 py-3 font-normal">Category</th>
            <th className="px-4 py-3 font-normal">Sizes</th>
            <th className="px-4 py-3 font-normal">Stock</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-seam last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-ink">
                    {p.image_url && (
                      <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-bone">{p.title}</p>
                    {p.is_new && (
                      <span className="text-[11px] text-oxblood2">New arrival</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-smoke">
                ₹{p.price.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-3 text-smoke">{p.category || "—"}</td>
              <td className="px-4 py-3 text-smoke">{p.sizes?.join(", ") || "—"}</td>
              <td className="px-4 py-3 text-smoke">{p.stock ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-[11px] ${
                    p.in_stock
                      ? "bg-panel text-smoke"
                      : "border border-oxblood2 text-oxblood2"
                  }`}
                >
                  {p.in_stock ? "In stock" : "Sold out"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(p)}
                    aria-label={`Edit ${p.title}`}
                    className="text-smoke hover:text-bone"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    aria-label={`Delete ${p.title}`}
                    className="text-smoke hover:text-oxblood2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
