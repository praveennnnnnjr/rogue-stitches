'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  };

  useEffect(() => {
    loadCart();

    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const updateQuantity = (id: string, size: string, change: number) => {
    const updated = cartItems.map((item) => {
      if (item.id === id && item.size === size) {
        const newQty = item.quantity + change;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id: string, size: string) => {
    const filtered = cartItems.filter(
      (item) => !(item.id === id && item.size === size)
    );
    setCartItems(filtered);
    localStorage.setItem('cart', JSON.stringify(filtered));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-void text-bone p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-white mb-8 border-b border-seam pb-4 font-mono">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-seam rounded-lg">
            <p className="text-sm font-mono text-smoke mb-4">Your cart is empty.</p>
            <Link
              href="/"
              className="inline-block bg-panel hover:bg-seam border border-seam text-bone px-6 py-2 rounded text-xs font-mono uppercase tracking-wider transition"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${item.size}-${index}`}
                  className="flex gap-4 p-4 bg-panel border border-seam rounded-lg items-center justify-between"
                >
                  <div className="relative w-20 h-20 bg-void rounded overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-smoke font-mono">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-white font-mono uppercase">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-smoke">Size: {item.size}</p>
                    <p className="text-sm font-mono font-bold text-bone mt-1">
                      ₹{item.price}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 bg-void border border-seam px-2 py-1 rounded">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, -1)}
                      className="text-smoke hover:text-white px-1 font-mono"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, 1)}
                      className="text-smoke hover:text-white px-1 font-mono"
                    >
                      +
                    </button>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-smoke hover:text-red-400 p-2 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-panel border border-seam p-6 rounded-lg h-fit space-y-4">
              <h2 className="text-sm font-mono uppercase font-bold text-white border-b border-seam pb-3">
                Order Summary
              </h2>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-smoke">Subtotal</span>
                <span className="text-bone font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-smoke">Shipping</span>
                <span className="text-emerald-400">FREE</span>
              </div>
              <hr className="border-seam" />
              <div className="flex justify-between font-mono text-base font-bold text-white">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
              <Link
                href="/checkout"
                className="block w-full text-center bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold py-3 uppercase tracking-wider rounded transition"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}