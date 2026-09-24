

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { X, LogOut } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfilePopup(false);
  };

  const categories = [
    { name: 'Oversized Tees', href: '/category/oversized-tees' },
    { name: 'Acid Wash Shirts', href: '/category/acid-wash' },
    { name: 'Hoodies & Jackets', href: '/category/hoodies' },
    { name: 'Cargo Pants', href: '/category/cargos' },
    { name: 'New Arrivals', href: '/category/new-arrivals' },
  ];

  return (
    <>
      {/* Sleek Low-Height Header Bar */}
      <header className="w-full bg-void/90 backdrop-blur-md border-b border-seam sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative h-12">
          
          {/* Left Side: Hanging Spider with Web Line/Rope */}
          <div className="relative z-50 flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative cursor-pointer focus:outline-none group origin-top flex flex-col items-center"
              title="Explore Categories"
            >
              {/* Spider Rope / Web Line */}
              <div 
                className={`w-[2px] bg-gradient-to-b from-white/80 via-white/40 to-white/90 transition-all duration-500 ease-out origin-top ${
                  isMenuOpen ? 'h-12' : 'h-8 group-hover:h-11'
                }`}
              />

              {/* Spider Hanging Image below Header */}
              <img
                src="/spider.png"
                alt="Spider Menu"
                className={`w-12 h-auto filter brightness-0 invert drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] object-contain transition-all duration-500 ease-out origin-top ${
                  isMenuOpen ? 'scale-125 rotate-6' : 'group-hover:scale-110 group-hover:-rotate-3'
                }`}
              />
            </button>
          </div>

          {/* RIGHT SIDE: Mix-Blend Screen for Transparent Effect */}
          <div className="flex items-center gap-5">
            
            {/* 1. Fire Cart Image (Extra Large + Transparent Blend Effect) */}
            <Link 
              href="/cart" 
              className="hover:scale-110 transition-transform focus:outline-none flex items-center"
              title="Cart"
            >
              <img 
                src="/cart-fire.jpg" 
                alt="Cart" 
                className="w-20 h-20 object-contain mix-blend-screen" 
              />
            </Link>

            {/* 2. Skeleton Profile Image (Transparent Blend Effect) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                  className="hover:scale-110 transition-transform focus:outline-none flex items-center"
                  title="Profile"
                >
                  <img
                    src="/skeleton.jpg"
                    alt="Profile"
                    className="w-12 h-12 object-contain mix-blend-screen"
                  />
                </button>

                {/* Profile Popup Window */}
                {showProfilePopup && (
                  <div className="absolute right-0 mt-3 w-60 bg-void border border-seam rounded-lg p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[10px] uppercase font-mono text-smoke mb-1">Logged In As</p>
                    <p className="text-xs font-mono text-bone truncate pb-2 border-b border-seam mb-2">
                      {user.email}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-xs text-rust hover:text-red-400 font-mono py-1 transition"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hover:scale-110 transition-transform focus:outline-none flex items-center"
                title="Login"
              >
                <img
                  src="/skeleton.jpg"
                  alt="Login"
                  className="w-12 h-12 object-contain mix-blend-screen"
                />
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* Backdrop Overlay */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Side Category Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-void text-bone z-50 border-r border-seam p-6 shadow-2xl transition-transform duration-500 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8 pt-6 border-b border-seam pb-4">
          <h2 className="text-lg font-bold tracking-widest text-rust uppercase font-mono">
            CATEGORIES
          </h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-smoke hover:text-bone transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-3">
          {categories.map((cat, index) => (
            <Link
              key={index}
              href={cat.href}
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg bg-panel hover:bg-seam border border-seam text-bone hover:text-white font-medium tracking-wide transition-all duration-300 transform hover:translate-x-2"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 text-center text-xs text-smoke uppercase tracking-widest font-mono">
          Rogue Stitches © 2026
        </div>
      </div>
    </>
  );
}