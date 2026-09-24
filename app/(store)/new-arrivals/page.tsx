import ProductGrid from "@/components/ProductGrid";

export default function NewArrivalsPage() {
  return (
    <div className="pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-sm text-smoke">Fresh in</p>
        <h1 className="mt-1 font-display text-4xl text-bone sm:text-5xl">
          New Arrivals
        </h1>
      </div>
      <ProductGrid />
    </div>
  );
}
