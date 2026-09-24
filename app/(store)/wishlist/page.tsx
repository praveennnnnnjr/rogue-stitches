'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    // 1. Get Logged In User
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    // 2. Fetch Wishlist only for logged in user_id
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', user.id);

    if (!error && data) {
      setItems(data.map((item) => item.products));
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-bone">Loading wishlist...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-bone">
      <h1 className="text-2xl font-bold uppercase tracking-wider mb-6">Your Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-smoke">No items in your wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((product) => (
            <div key={product.id} className="bg-panel border border-seam p-4 rounded">
              <div className="relative h-64 w-full mb-4">
                <Image src={product.image_url} alt={product.title} fill className="object-cover rounded" />
              </div>
              <h3 className="font-bold uppercase text-sm">{product.title}</h3>
              <p className="text-smoke text-xs mb-2">₹{product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}