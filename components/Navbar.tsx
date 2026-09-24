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
    'Oversized Tees',
    'Shirts',
    'Track Pant',
    'Pants',
  ];

  return (
    <>
      {/* Header Bar - Removed overflow-hidden so spider can hang below */}
      <header className="w-full bg-void/90 backdrop-blur-md border-b border-seam sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative h-14">
          
          {/* Left Side: Hanging Spider with Web Line/Rope */}
          <div className="relative z-50 flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative cursor-pointer focus:outline-none group origin-top flex flex-col items-center"
              title="Explore Categories"
            >
              {/* Spider Rope / Web Line */}
              <div 
                className={`w-[2px] bg-gradient-to-b from-white/90 via-white/50 to-white/90 transition-all duration-500 ease-out origin-top ${
                  isMenuOpen ? 'h-14' : 'h-10 group-hover:h-12'
                }`}
              />

              {/* Spider Hanging Image */}
              <img
                src="/spider.png"
                alt="Spider Menu"
                className={`w-16 h-auto -mt-1 filter brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] object-contain transition-all duration-500 ease-out origin-top ${
                  isMenuOpen ? 'scale-125 rotate-6' : 'group-hover:scale-110 group-hover:-rotate-3'
                }`}
              />
            </button>
          </div>

          {/* RIGHT SIDE: Cart Image & Skeleton Profile Image */}
          <div className="flex items-center gap-6 h-full">
            
            {/* 1. Fire Cart Image */}
            <Link 
              href="/cart" 
              className="hover:scale-110 transition-transform focus:outline-none flex items-center h-full justify-center"
              title="Cart"
            >
              <img 
                src="/cart-fire.jpg" 
                alt="Cart" 
                className="w-12 h-12 object-contain block" 
              />
            </Link>

            {/* 2. Skeleton Profile Image */}
            {user ? (
              <div className="relative flex items-center h-full">
                <button
                  onClick={() => setShowProfilePopup(!showProfilePopup)}
                  className="hover:scale-110 transition-transform focus:outline-none flex items-center h-full justify-center"
                  title="Profile"
                >
                  <img
                    src="/skeleton.jpg"
                    alt="Profile"
                    className="w-10 h-10 object-contain"
                  />
                </button>

                {/* Profile Popup Window */}
                {showProfilePopup && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-void border border-seam rounded-lg p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
                className="hover:scale-110 transition-transform focus:outline-none flex items-center h-full justify-center"
                title="Login"
              >
                <img
                  src="/skeleton.jpg"
                  alt="Login"
                  className="w-10 h-10 object-contain"
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
          {/* Changed text-rust to text-white for clear visibility */}
          <h2 className="text-lg font-bold tracking-widest text-white uppercase font-mono">
            CATEGORIES
          </h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-smoke hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-3">
          {categories.map((cat, index) => (
            <Link
              key={index}
              href={`/category/${encodeURIComponent(cat)}`}
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 rounded-lg bg-panel hover:bg-seam border border-seam text-bone hover:text-white font-medium tracking-wide transition-all duration-300 transform hover:translate-x-2"
            >
              {cat}
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