"use client";

import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Categories from "@/components/Categories";
import ProductCatalog from "@/components/ProductCatalog";
import CartDrawer from "@/components/CartDrawer";
import ValueProps from "@/components/ValueProps";
import Footer from "@/components/Footer";
import GlowSettings from "@/components/GlowSettings";

export default function Home() {
  return (
    <CartProvider>
      <GlowSettings />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <Categories />
        <ProductCatalog />
        <ValueProps />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
