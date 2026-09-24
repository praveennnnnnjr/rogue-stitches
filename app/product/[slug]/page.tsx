'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const rawParam = params?.slug as string;
  const paramValue = rawParam ? decodeURIComponent(rawParam) : '';

  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);

  useEffect(() => {
    if (paramValue) {
      fetchProduct();
    }
  }, [paramValue]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');
      const isNumeric = /^\d+$/.test(paramValue);

      if (isNumeric) {
        query = query.or(`id.eq.${paramValue},slug.eq.${paramValue}`);
      } else {
        query = query.or(`slug.eq.${paramValue},id.eq.${paramValue}`);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        const { data: allProducts } = await supabase.from('products').select('*');
        const found = allProducts?.find(
          (p) => String(p.id) === paramValue || p.slug === paramValue
        );
        setProduct(found || null);
      } else {
        setProduct(data[0]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);

    // Get current cart items from LocalStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product with same ID and Size already exists
    const existingIndex = existingCart.findIndex(
      (item: any) => item.id === product.id && item.size === selectedSize
    );

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
        size: selectedSize,
        quantity: quantity,
      });
    }

    // Save back to LocalStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch custom event so Cart page detects update immediately
    window.dispatchEvent(new Event('cartUpdated'));

    setAdding(false);

    // Redirect to Cart page
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-smoke font-mono">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center text-smoke font-mono gap-4">
        <p className="text-lg text-white">Product not found.</p>
        <button 
          onClick={() => router.back()} 
          className="text-xs bg-panel border border-seam text-bone px-4 py-2 rounded uppercase hover:bg-seam"
        >
          Go Back
        </button>
      </div>
    );
  }

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const isSoldOut = (product.stock ?? 0) <= 0;

  return (
    <div className="min-h-screen bg-void text-bone p-6 md:p-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left Side: Product Image */}
        <div className="relative aspect-square w-full bg-panel rounded-lg overflow-hidden border border-seam">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-smoke font-mono">
              No Image Available
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <p className="text-xs uppercase font-mono tracking-widest text-smoke mb-1">
              {product.category || 'OVERSIZED TEES'}
            </p>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
              {product.title}
            </h1>
            <p className="text-2xl font-mono font-bold text-bone mt-2">
              ₹{product.price}
            </p>
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded text-[11px] font-mono font-bold uppercase ${
                isSoldOut
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {isSoldOut ? 'Out of Stock' : `In Stock: ${product.stock} items left`}
            </span>
          </div>

          <hr className="border-seam" />

          {/* Size Selection */}
          <div>
            <p className="text-xs font-mono uppercase text-smoke mb-2">Select Size</p>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 rounded border font-mono text-xs transition-colors ${
                    selectedSize === size
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-panel border-seam text-bone hover:border-bone'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div>
            <p className="text-xs font-mono uppercase text-smoke mb-2">Quantity</p>
            <div className="flex items-center space-x-3 bg-panel border border-seam w-fit px-3 py-1 rounded">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-smoke hover:text-white px-2 font-mono"
              >
                -
              </button>
              <span className="font-mono text-sm">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock || 10, q + 1))
                }
                className="text-smoke hover:text-white px-2 font-mono"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button ONLY */}
          <div className="pt-4">
            <button
              disabled={isSoldOut || adding}
              onClick={handleAddToCart}
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-mono text-xs tracking-widest font-bold py-4 px-6 rounded transition uppercase"
            >
              {adding ? 'ADDING...' : 'ADD TO CART'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}