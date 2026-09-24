"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product, Size } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCheckout } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [size, setSize] = useState<Size | null>(null);
  const [error, setError] = useState(false);

  // Database-la sizes illanalum default sizes ('S', 'M', 'L', 'XL') fallback aagum
  const defaultSizes: Size[] = ["S", "M", "L", "XL"];
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;

  const wishlisted = isWishlisted(product.id);
  const href = `/product/${product.slug || product.id}`;

  const handleAdd = () => {
    if (!size) {
      setError(true);
      return;
    }
    addItem(product, size);
  };

  const handleBuyNow = () => {
    if (!size) {
      setError(true);
      return;
    }
    addItem(product, size);
    openCheckout();
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group flex flex-col border border-seam bg-panel">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-ink">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-smoke">
            No image
          </div>
        )}

        {product.is_new && (
          <span className="absolute left-2 top-2 bg-oxblood2 px-2 py-1 text-[11px] font-semibold text-bone">
            New
          </span>
        )}

        <button
          onClick={handleWishlistClick}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-seam bg-void/70 text-bone backdrop-blur transition-colors hover:border-oxblood2"
        >
          <Heart
            size={15}
            className={wishlisted ? "fill-oxblood2 text-oxblood2" : "text-bone"}
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link href={href} className="text-sm font-medium text-bone hover:text-oxblood2 uppercase tracking-wide">
            {product.title}
          </Link>
          <p className="mt-1 text-sm text-smoke">₹{product.price?.toLocaleString("en-IN")}</p>
        </div>

        {/* Size Selection Buttons */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-smoke mb-1.5 font-semibold">
            Select Size:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s as Size);
                  setError(false);
                }}
                className={`h-8 min-w-8 border px-2.5 text-xs font-bold transition-colors ${
                  size === s
                    ? "border-oxblood2 bg-oxblood2 text-bone"
                    : "border-seam text-smoke hover:border-bone hover:text-bone"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-oxblood2 font-medium">Pick a size first.</p>}

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 border border-seam py-2 text-xs font-medium text-bone transition-colors hover:border-bone"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 bg-bone py-2 text-xs font-medium text-void transition-colors hover:bg-oxblood2 hover:text-bone"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}