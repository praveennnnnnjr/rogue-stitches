"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, X } from "lucide-react";
import { ALL_SIZES, CATEGORIES, type CategorySlug, type Product, type Size } from "@/lib/types";
import { slugify } from "@/lib/slugify";
import { addOfflineProduct, updateOfflineProduct } from "@/lib/adminLocalStore";

interface Props {
  token: string;
  product?: Product | null;
  offlineMode: boolean;
  onSaved: () => void;
  onCancel: () => void;
}

const emptyForm = {
  title: "",
  slug: "",
  price: "",
  category: CATEGORIES[0].slug as string,
  description: "",
  sizes: [] as Size[],
  stock: "0",
  is_new: false,
  image_url: "" as string | null,
};

export default function ProductForm({
  token,
  product,
  offlineMode,
  onSaved,
  onCancel,
}: Props) {
  const [form, setForm] = useState(() =>
    product
      ? {
          title: product.title,
          slug: product.slug,
          price: String(product.price),
          category: product.category,
          description: product.description ?? "",
          sizes: product.sizes ?? [],
          // Fall back sensibly for products saved before `stock` existed.
          stock: String(product.stock ?? (product.in_stock ? 1 : 0)),
          is_new: product.is_new,
          image_url: product.image_url,
        }
      : emptyForm
  );
  // Once the admin edits the slug by hand, stop overwriting it when they
  // keep typing the title — otherwise a deliberate slug change gets
  // silently clobbered on the next keystroke.
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSize(size: Size) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, image_url: data.url }));
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const finalSlug = slugify(form.slug || form.title);

    if (!form.title.trim() || !form.price || form.sizes.length === 0) {
      setError("Title, price and at least one size are required.");
      return;
    }
    if (!finalSlug) {
      setError("Couldn't generate a valid slug from that title — edit the slug field directly.");
      return;
    }

    setSaving(true);
    try {
      const stockCount = Math.max(0, Math.floor(Number(form.stock) || 0));
      const payload = {
        title: form.title.trim(),
        slug: finalSlug,
        description: form.description.trim() || null,
        price: Number(form.price),
        category: form.category as CategorySlug,
        sizes: form.sizes,
        stock: stockCount,
        in_stock: stockCount > 0,
        is_new: form.is_new,
        image_url: form.image_url,
      };

      if (offlineMode) {
        // No Supabase connection right now — save to this browser's
        // localStorage instead so the owner doesn't lose the work.
        if (product) updateOfflineProduct(product.id, payload);
        else addOfflineProduct(payload);
        onSaved();
        return;
      }

      const res = await fetch("/api/admin/products", {
        method: product ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product ? { id: product.id, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved();
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-seam bg-panel p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-bone">
          {product ? "Edit Product" : "Add Product"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-smoke hover:text-bone"
          aria-label="Close form"
        >
          <X size={18} />
        </button>
      </div>

      {offlineMode && (
        <p className="border border-seam bg-ink px-3 py-2 text-xs text-smoke">
          Supabase isn&apos;t reachable — this will save to this browser only
          (localStorage), not your database. Image upload is unavailable in
          this mode; paste an image URL instead.
        </p>
      )}

      <div className="flex gap-4">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden border border-seam bg-ink">
          {form.image_url ? (
            <Image src={form.image_url} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-smoke">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-smoke">Image URL</span>
            <input
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://…"
              className="border border-seam bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-oxblood2"
            />
          </label>

          {!offlineMode && (
            <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-seam py-2 text-center text-xs text-smoke hover:border-oxblood2 hover:text-bone">
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UploadCloud size={14} />
              )}
              <span>{uploading ? "Uploading…" : "or upload a file"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-smoke">Title</span>
        <input
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm((f) => ({
              ...f,
              title,
              slug: slugTouched ? f.slug : slugify(title),
            }));
          }}
          className="border border-seam bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-oxblood2"
          placeholder="Reaper Hoodie"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-smoke">Slug (used in the product URL)</span>
        <input
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm({ ...form, slug: slugify(e.target.value) });
          }}
          className="border border-seam bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-oxblood2"
          placeholder="reaper-hoodie"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs text-smoke">Price (₹)</span>
          <input
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })
            }
            inputMode="decimal"
            className="border border-seam bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-oxblood2"
            placeholder="2499"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs text-smoke">Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-seam bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-oxblood2"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-smoke">Description</span>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="resize-none border border-seam bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-oxblood2"
          placeholder="Heavyweight cotton, oversized fit, embroidered back print."
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-smoke">Available sizes</span>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={`h-8 min-w-8 border px-2 text-xs transition-colors ${
                form.sizes.includes(s)
                  ? "border-oxblood2 bg-oxblood2 text-bone"
                  : "border-seam text-smoke hover:border-bone hover:text-bone"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-smoke">Stock count</span>
          <input
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: e.target.value.replace(/[^\d]/g, "") })
            }
            inputMode="numeric"
            className="w-28 border border-seam bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-oxblood2"
            placeholder="0"
          />
        </label>
        <p className="pb-2.5 text-xs text-smoke">
          {Number(form.stock) > 0
            ? `Will show as in stock (${Number(form.stock)} available).`
            : "0 means sold out — hidden from Add to Cart / Buy Now."}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-smoke">
        <input
          type="checkbox"
          checked={form.is_new}
          onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
          className="accent-oxblood2"
        />
        Mark as new arrival
      </label>

      {error && <p className="text-sm text-oxblood2">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-oxblood2 px-5 py-2.5 text-sm font-medium text-bone hover:bg-oxblood disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {product ? "Save Changes" : "Add Product"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-seam px-5 py-2.5 text-sm text-smoke hover:text-bone"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
