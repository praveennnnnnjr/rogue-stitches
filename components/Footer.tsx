export default function Footer() {
  return (
    <footer className="w-full bg-void border-t border-seam py-10 px-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
        
        {/* Center: Large Logo Image Only */}
        <div className="flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Rogue Stitches Logo" 
            className="h-16 w-auto object-contain md:h-20" // Logo height perusa aakirukku
          />
        </div>

        {/* Center: Tagline Sentence */}
        <p className="text-xs font-mono text-smoke tracking-wide">
          Street wear, stitched for the after-dark.
        </p>

        {/* Center Divider Line */}
        <div className="w-full max-w-xs border-t border-seam/40 my-4" />

        {/* Center: Copyright Shop Name */}
        <p className="text-[11px] font-mono text-smoke/70 uppercase tracking-widest">
          © 2026 ROGUESTITCHES. ALL RIGHTS RESERVED.
        </p>

      </div>
    </footer>
  );
}