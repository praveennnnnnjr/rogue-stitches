import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutModal from "@/components/CheckoutModal";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      {/* Checkout still overlays as a modal (opened from /cart), everything
          else that used to be a drawer is now its own route. */}
      <CheckoutModal />
    </>
  );
}
