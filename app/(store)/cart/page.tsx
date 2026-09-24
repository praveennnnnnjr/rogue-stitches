'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const loadCart = () => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
  };

  // Helper Function: Extracts the 1st valid image URL
  const getCartImage = (imageUrl: string) => {
    if (!imageUrl) return '';
    const urls = imageUrl.split(',').map((url) => url.trim());
    return urls[0] || '';
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cartItems];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen bg-void text-bone p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-8 text-white">
          YOUR CART
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-panel border border-seam rounded-lg">
            <p className="text-smoke font-mono mb-4">Your cart is currently empty.</p>
            <Link
              href="/"
              className="text-xs bg-white text-black font-mono font-bold px-6 py-3 rounded uppercase hover:bg-zinc-200 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map((item, index) => {
                const itemImg = getCartImage(item.image_url);

                return (
                  <div
                    key={`${item.id}-${item.size}-${index}`}
                    className="bg-panel border border-seam rounded-lg p-4 flex items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Thumbnail Image */}
                      <div className="w-20 h-20 bg-void rounded border border-seam overflow-hidden flex-shrink-0">
                        {itemImg ? (
                          <img
                            src={itemImg}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-smoke font-mono">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <h2 className="text-sm font-bold uppercase text-white tracking-wide">
                          {item.title}
                        </h2>
                        <p className="text-xs font-mono text-smoke mt-1">
                          Size: <span className="text-bone">{item.size}</span>
                        </p>
                        <p className="text-sm font-mono font-bold text-bone mt-1">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2 bg-void border border-seam px-2 py-1 rounded">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="text-smoke hover:text-white px-1 font-mono text-xs"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="text-smoke hover:text-white px-1 font-mono text-xs"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        className="text-smoke hover:text-red-400 p-2 transition"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-panel border border-seam rounded-lg p-6 flex flex-col gap-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-smoke border-b border-seam pb-3">
                ORDER SUMMARY
              </h2>

              <div className="flex justify-between text-sm font-mono">
                <span className="text-smoke">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-sm font-mono">
                <span className="text-smoke">Shipping</span>
                <span className="text-emerald-400">FREE</span>
              </div>

              <hr className="border-seam" />

              <div className="flex justify-between text-base font-mono font-bold">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              <button className="w-full bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold py-4 rounded uppercase tracking-widest transition mt-2">
                PROCEED TO CHECKOUT
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}