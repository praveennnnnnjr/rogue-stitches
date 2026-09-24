'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function CategoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper Function: Multiple images comma-separated ah irundhalum 1st image-a extract pannum
  const getFirstImage = (imageUrlString: string) => {
    if (!imageUrlString) return '';
    const images = imageUrlString.split(',').map((img) => img.trim());
    return images[0] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-smoke font-mono">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void text-bone p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs font-mono uppercase text-smoke tracking-widest mb-1">
          CATEGORY
        </p>
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-8 text-white">
          TRACK PANT
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const firstImage = getFirstImage(product.image_url);

            return (
              <div
                key={product.id}
                className="bg-panel border border-seam rounded-lg overflow-hidden flex flex-col justify-between"
              >
                {/* Product 1st Image Display */}
                <div className="relative aspect-square w-full bg-void overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-smoke font-mono text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-smoke uppercase tracking-widest">
                    {product.category || 'TRACK PANT'}
                  </span>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide truncate">
                    {product.title}
                  </h2>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-mono font-bold text-bone">
                      ₹{product.price}
                    </p>
                    <Link
                      href={`/product/${product.slug || product.id}`}
                      className="text-[11px] font-mono text-smoke hover:text-white uppercase tracking-wider transition"
                    >
                      VIEW DETAILS &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}