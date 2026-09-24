'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

export default function CategoryProductsPage() {
  const params = useParams();
  const rawCategoryName = params?.name ? decodeURIComponent(params.name as string) : '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rawCategoryName) {
      fetchCategoryProducts();
    }
  }, [rawCategoryName]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    
    // Admin upload panna category field kooda match panni filter pannudhu (case insensitive)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('category', rawCategoryName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching category products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-void text-bone p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="mb-8 border-b border-seam pb-4">
          <p className="text-xs uppercase font-mono tracking-widest text-smoke mb-1">
            Category
          </p>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
            {rawCategoryName}
          </h1>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center font-mono text-smoke">
            Loading products for {rawCategoryName}...
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center border border-dashed border-seam rounded-lg">
            <p className="text-lg font-mono text-smoke">
              No products available in "{rawCategoryName}" category yet.
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isSoldOut = (product.stock ?? 0) <= 0;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug || product.id}`}
                  className="group bg-panel border border-seam hover:border-bone rounded-lg overflow-hidden transition flex flex-col"
                >
                  <div className="relative aspect-square w-full bg-void">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-smoke font-mono">
                        No Image
                      </div>
                    )}

                    {/* Sold out Badge */}
                    {isSoldOut && (
                      <div className="absolute top-2 right-2 bg-red-950/90 border border-red-800 text-red-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        SOLD OUT
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase text-smoke mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-bold text-sm tracking-wide text-white group-hover:text-bone line-clamp-1">
                        {product.title}
                      </h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-bone">
                        ₹{product.price}
                      </span>
                      <span className="text-xs uppercase font-mono text-smoke group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}