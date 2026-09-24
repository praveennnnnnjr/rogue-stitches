import ProductGrid from "@/components/ProductGrid";

export default function ShopPage() {
  return (
    <div className="pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-sm text-smoke">Shop</p>
        <h1 className="mt-1 font-display text-4xl text-bone sm:text-5xl">
          Every Piece
        </h1>
      </div>
      <ProductGrid />
    </div>
  );
}
