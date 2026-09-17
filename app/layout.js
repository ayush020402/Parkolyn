import { Playfair_Display, Antic_Didone, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import GrainOverlay from "@/components/GrainOverlay";
import { CartProvider } from "@/lib/cart-context";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Brand wordmark only ("Parkolyn Amsterdam" in the header/footer/logo
// spots) — matched to the client's logo reference. Not used for other
// headings, which stay on Playfair Display.
const anticDidone = Antic_Didone({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "Parkolyn Amsterdam — Signature Fragrances",
  description:
    "Parkolyn Amsterdam crafts fragrance built around one idea: an unmistakable, honest signature scent. Our story, our passion, your signature. Shop the collection, open for pre-order.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${anticDidone.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <GrainOverlay />
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
