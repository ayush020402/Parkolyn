import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import GrainOverlay from "@/components/GrainOverlay";
import { CartProvider } from "@/lib/cart-context";

// Storefront chrome. Lives in a route group so the admin panel (app/admin)
// gets a completely separate layout with none of this.
export default function SiteLayout({ children }) {
  return (
    <>
      <GrainOverlay />
      <CartProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
      </CartProvider>
    </>
  );
}
