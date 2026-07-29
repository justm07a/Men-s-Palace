"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export const CONTENT_DEFAULTS: Record<string, string> = {
  hero_badge: "Premium Collection 2026",
  hero_title_line1: "ELEVATE YOUR",
  hero_title_line2: "STYLE IN",
  hero_title_highlight: "EVERY",
  hero_title_suffix: "REALITY",
  hero_subtitle: "Discover premium outerwear crafted for the modern gentleman. Where luxury meets urban edge.",
  hero_btn_primary: "Shop Now",
  hero_btn_secondary: "Explore All",

  categories_title: "SHOP BY CATEGORY",
  categories_show_more: "Show More Categories",

  arrivals_title: "NEW ARRIVALS",
  arrivals_subtitle: "Explore our latest drops curated for the discerning gentleman",
  arrivals_view_all: "View All Categories",

  promo_badge: "Limited Time Offer",
  promo_title: "UP TO 30% OFF",
  promo_subtitle: "Premium outerwear at exceptional prices. Don't miss out on our exclusive seasonal sale.",
  promo_btn: "SHOP THE SALE",

  features_title: "THE MEN'S PALACE DIFFERENCE",
  features_1_title: "Free Shipping",
  features_1_desc: "Complimentary local & express shipping on all orders over EGP 2,000.",
  features_2_title: "Easy Returns",
  features_2_desc: "30-day hassle-free returns and exchanges with prepaid labels.",
  features_3_title: "Secure Checkout",
  features_3_desc: "256-bit encrypted payments. Your data is always protected.",
  features_4_title: "24/7 Support",
  features_4_desc: "Dedicated concierge team available around the clock for you.",

  footer_tagline: "Premium streetwear crafted for the modern gentleman. Where luxury meets urban edge.",
  footer_shop: "Shop",
  footer_brand: "Brand",
  footer_legal: "Legal",
  footer_copyright: "© 2026 Men's Palace. All rights reserved.",
};

const SiteContentContext = createContext<Record<string, string>>(CONTENT_DEFAULTS);

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>(CONTENT_DEFAULTS);

  const fetchContent = useCallback(() => {
    fetch("/api/content/public")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          const merged = { ...CONTENT_DEFAULTS };
          for (const key of Object.keys(CONTENT_DEFAULTS)) {
            if (data[key] && typeof data[key] === "string" && data[key].trim()) {
              merged[key] = data[key];
            }
          }
          setContent(merged);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}
