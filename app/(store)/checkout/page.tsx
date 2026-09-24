'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * item.quantity,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!window.Razorpay) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    setLoading(true);

    // Razorpay Options Setup
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere', // Replace with your Razorpay Key ID
      amount: subtotal * 100, // Amount in paise (₹598 = 59800)
      currency: 'INR',
      name: 'Rogue Stitches',
      description: 'Order Payment',
      image: '/logo.png', // Optional: Your store logo URL
      handler: function (response: any) {
        // Payment Successful Callback
        console.log('Payment Successful:', response);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));

        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        setLoading(false);
        router.push('/');
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
      },
      theme: {
        color: '#000000',
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const razorpayWindow = new window.Razorpay(options);
    razorpayWindow.open();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-void text-bone flex flex-col items-center justify-center p-6">
        <p className="text-sm font-mono text-smoke mb-4">No items in cart to checkout.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-panel border border-seam text-bone px-6 py-2 rounded text-xs font-mono uppercase"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Razorpay Script Import */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-void text-bone p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white mb-8 border-b border-seam pb-4 font-mono">
            Checkout
          </h1>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Shipping Details Only */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-panel border border-seam p-6 rounded-lg space-y-4">
                <h2 className="text-sm font-mono uppercase font-bold text-white border-b border-seam pb-2">
                  Shipping Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-smoke mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-void border border-seam rounded p-3 text-white focus:outline-none focus:border-bone"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-smoke mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-void border border-seam rounded p-3 text-white focus:outline-none focus:border-bone"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="font-mono text-xs">
                  <label className="block text-smoke mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-void border border-seam rounded p-3 text-white focus:outline-none focus:border-bone"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="font-mono text-xs">
                  <label className="block text-smoke mb-1">Delivery Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-void border border-seam rounded p-3 text-white focus:outline-none focus:border-bone"
                    placeholder="House No, Street, Landmark"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-smoke mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-void border border-seam rounded p-3 text-white focus:outline-none focus:border-bone"
                      placeholder="Chennai"
                    />
                  </div>

                  <div>
                    <label className="block text-smoke mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full bg-void border border-seam rounded p-3 text-white focus:outline-none focus:border-bone"
                      placeholder="600001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-panel border border-seam p-6 rounded-lg h-fit space-y-4">
              <h2 className="text-sm font-mono uppercase font-bold text-white border-b border-seam pb-3">
                Order Summary ({cartItems.length} items)
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 bg-void rounded overflow-hidden flex-shrink-0">
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 text-xs font-mono">
                      <p className="text-white truncate font-bold">{item.title}</p>
                      <p className="text-smoke">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-mono font-bold text-bone">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <hr className="border-seam" />

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-smoke">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-smoke">
                  <span>Shipping</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-seam">
                  <span>Total Amount</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-mono text-xs font-bold py-4 uppercase tracking-wider rounded transition mt-4"
              >
                {loading ? 'OPENING RAZORPAY...' : 'PLACE ORDER'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}