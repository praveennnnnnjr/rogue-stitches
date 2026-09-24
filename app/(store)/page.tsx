'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel(`customer-products-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  // Helper function: Multiple URLs (comma-separated or array) irundhalum 1st image URL-a extraction pannum
  const getFirstImageUrl = (product: any) => {
    if (Array.isArray(product?.image_urls) && product.image_urls.length > 0) {
      return product.image_urls[0];
    }
    if (product?.image_url) {
      const urls = product.image_url.split(',').map((url: string) => url.trim());
      return urls[0] || '';
    }
    return '';
  };

  return (
    <main className="min-h-screen bg-void text-bone">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Hero Background"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-void/60" />
        </div>

        <div className="relative z-10 text-center px-4 flex flex-col items-center justify-center">
          <div className="relative w-[260px] h-[90px] sm:w-[360px] sm:h-[120px] md:w-[420px] md:h-[140px] mb-6 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
            <Image
              src="/logo.png"
              alt="ROGUESTITCHES"
              fill
              className="object-contain"
              priority
            />
          </div>

          <a
            href="#products"
            className="border border-bone text-bone hover:bg-bone hover:text-void font-bold px-8 py-3 text-xs tracking-widest uppercase transition duration-200 bg-void/60 backdrop-blur-sm"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-8 text-center border-b border-seam pb-4">
          Latest Arrivals
        </h2>

        {loading ? (
          <div className="text-center text-smoke py-12">Loading collection...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-smoke py-12">No products available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const mainImg = getFirstImageUrl(product);

              return (
                <div
                  key={product.id}
                  className="bg-panel border border-seam rounded-lg overflow-hidden group hover:border-bone transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full h-64 bg-ink overflow-hidden">
                      {mainImg ? (
                        <img
                          src={mainImg}
                          alt={product.title || 'Product Image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-smoke text-xs p-4 text-center">
                          No Valid Image
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] uppercase tracking-widest text-smoke block mb-1">
                        {product.category || 'TRACK PANT'}
                      </span>
                      <h3 className="font-bold text-sm uppercase tracking-wide truncate">
                        {product.title}
                      </h3>
                      <p className="text-sm font-semibold mt-2">₹{product.price}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/product/${product.slug || product.id}`}
                      className="block text-center w-full bg-bone text-void font-bold py-2 rounded text-xs uppercase tracking-wider hover:bg-smoke transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}