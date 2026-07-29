"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Minus, Plus, ShoppingCart, ImageIcon, Grid3X3 } from "lucide-react";
import Image from "next/image";
import { parseDBProduct } from "@/lib/db-products";
import type { Product } from "@/lib/types";
import { useCartContext } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { title: string; image: string }> = {
  "Jackets": { title: "OUTERWEAR", image: "/logo.jpg" },
  "Hoodies": { title: "HOODIES & ESSENTIALS", image: "/logo.jpg" },
  "Pants": { title: "PANTS", image: "/logo.jpg" },
  "Shirts": { title: "SHIRTS", image: "/logo.jpg" },
  "KOL 7AGA": { title: "KOL 7AGA", image: "/logo.jpg" },
};

function getMeta(name: string) {
  return CATEGORY_META[name] || { title: name, image: "/logo.jpg" };
}

const genieSpring = { type: "spring" as const, stiffness: 350, damping: 25, mass: 0.8 };

/* ─── Product Detail Modal ─── */
function ProductDetailModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const { addItem } = useCartContext();

  useEffect(() => {
    if (product) { setSelectedSize(product.sizes[0] || "M"); setQuantity(1); setActiveImageIndex(0); setDescExpanded(false); }
  }, [product]);

  const handleAdd = useCallback(() => {
    if (product) { addItem(product, selectedSize, quantity); onClose(); }
  }, [product, selectedSize, quantity, addItem, onClose]);

  const allImages = product?.images || [];
  const detailsScale = product?.detailsScale || 1;
  const description = product!.description || "";
  const needsTruncate = description.length > 60;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xl" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.85, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 40 }} transition={genieSpring}             className="fixed inset-x-3 inset-y-3 z-[120] mx-auto my-auto flex max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-8 sm:inset-y-8">
            <div className="flex h-full flex-col overflow-hidden sm:grid sm:grid-cols-2">
              {/* Image section */}
              <div className="relative flex min-h-[280px] flex-col bg-[#f0f0ec] sm:flex-1">
                <div className="relative flex-1 min-h-0">
                  {allImages[activeImageIndex] ? (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${detailsScale})` }}>
                      <Image src={allImages[activeImageIndex]} alt={product!.title} fill className="object-contain p-4" sizes="50vw" />
                    </div>
                  ) : (<div className="flex h-full items-center justify-center"><ImageIcon className="h-16 w-16 text-black/10" /></div>)}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto px-3 py-2">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => setActiveImageIndex(i)} className={cn("relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all", i === activeImageIndex ? "border-black" : "border-transparent opacity-60")}>
                        <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details section - scrollable */}
              <div className="flex flex-col overflow-y-auto overscroll-contain p-5 sm:p-8">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/40">{product!.category}</p>
                  <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-sm hover:bg-black/10">✕</button>
                </div>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">{product!.title}</h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xl font-bold">EGP {product!.price.toLocaleString()}</span>
                  {product!.discountPrice && <span className="text-sm text-black/40 line-through">EGP {product!.discountPrice.toLocaleString()}</span>}
                </div>

                {/* Description: 1 line + show more */}
                {needsTruncate ? (
                  <div className="mt-3">
                    <p className={cn("text-sm leading-relaxed text-black/60", !descExpanded && "line-clamp-1")}>{description}</p>
                    <button onClick={() => setDescExpanded(!descExpanded)} className="mt-1 text-xs font-bold text-black/40 hover:text-black/60">
                      {descExpanded ? "Show less" : "Show more"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-black/60">{description}</p>
                )}

                <div className="mt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product!.sizes.map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={cn("flex h-10 min-w-[40px] items-center justify-center rounded-xl border-2 px-3 text-xs font-bold transition-all", selectedSize === size ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30")}>{size}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider">Quantity</p>
                  <div className="flex items-center rounded-xl border-2 border-black/10 w-fit">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center hover:bg-black/5"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="flex h-10 w-10 items-center justify-center hover:bg-black/5"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-6 pb-2">
                  <button onClick={handleAdd} disabled={!product!.inStock} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-bold text-white transition-all hover:bg-black/80 disabled:opacity-40">
                    <ShoppingCart className="h-5 w-5" />{product!.inStock ? "ADD TO CART" : "OUT OF STOCK"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Category Sheet ─── */
function CategorySheet({ title, products, onClose, onProductClick }: { title: string; products: Product[]; onClose: () => void; onProductClick: (p: Product) => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xl" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={genieSpring} className="fixed inset-x-4 bottom-4 top-20 z-[95] mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-6 sm:bottom-6 sm:top-16">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="text-lg font-black">{title}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-sm hover:bg-black/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20"><p className="text-sm text-black/40">No products in this category yet</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="group cursor-pointer" onClick={() => onProductClick(product)}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f0f0ec]">
                    {product.image ? (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${product.cardScale || 1})` }}>
                        <Image src={product.image} alt={product.title} fill className="object-contain p-2 transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
                      </div>
                    ) : (<div className="flex h-full items-center justify-center"><ImageIcon className="h-10 w-10 text-black/10" /></div>)}
                    {product.badge && <span className="absolute left-2 top-2 rounded-full bg-black px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">{product.badge}</span>}
                  </div>
                  <div className="mt-2 px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-black/40">{product.category}</p>
                    <h3 className="mt-0.5 text-sm font-bold leading-tight">{product.title}</h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-sm font-bold">EGP {product.price.toLocaleString()}</span>
                      {product.discountPrice && <span className="text-xs text-black/40 line-through">EGP {product.discountPrice.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Show More Sheet ─── */
function ShowMoreSheet({ categories, onClose, onSelect }: { categories: { name: string; image?: string | null }[]; onClose: () => void; onSelect: (filter: string) => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xl" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={genieSpring} className="fixed inset-x-4 bottom-4 top-20 z-[95] mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-6 sm:bottom-6 sm:top-24">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="text-lg font-black">More Categories</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-sm hover:bg-black/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((cat) => {
              const meta = getMeta(cat.name);
              return (
                <button key={cat.name} onClick={() => { onSelect(cat.name); onClose(); }} className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-[#f5f5f0] p-4 text-left transition-all hover:bg-black hover:text-white">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-black/5">
                    <Image src={cat.image || meta.image} alt={meta.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold">{meta.title}</h3>
                    <p className="mt-0.5 text-[11px] text-black/40 group-hover:text-white/50">{cat.name}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-5 w-5 flex-shrink-0 text-black/20 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/60" />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════
   CATEGORIES
   ═══════════════════════════════════════ */
export default function Categories() {
  const [homeFilters, setHomeFilters] = useState<string[]>([]);
  const [homeFiltersMobile, setHomeFiltersMobile] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; image?: string | null }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fetchAll = useCallback(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([cats, settings, products]) => {
        if (Array.isArray(cats)) setDbCategories(cats.map((c: { id: string; name: string; image?: string | null }) => ({ id: c.id, name: c.name, image: c.image })));
        setAllProducts(products.map(parseDBProduct));
        if (settings.home_categories) {
          try {
            const parsed = JSON.parse(settings.home_categories);
            if (Array.isArray(parsed)) setHomeFilters(parsed);
          } catch {}
        }
        if (settings.home_categories_mobile) {
          try {
            const parsed = JSON.parse(settings.home_categories_mobile);
            if (Array.isArray(parsed)) setHomeFiltersMobile(parsed);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const activeHomeFilters = isMobile ? homeFiltersMobile : homeFilters;
  const homeCategories = dbCategories.filter((c) => activeHomeFilters.includes(c.name));
  const moreCategories = dbCategories.filter((c) => !activeHomeFilters.includes(c.name));

  const filteredProducts = allProducts.filter((p) => activeCategory && p.category === activeCategory);

  const handleCategoryClick = useCallback((filter: string) => {
    setActiveCategory(filter);
    setDetailProduct(null);
  }, []);

  return (
    <>
      <section id="categories" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center text-3xl font-black tracking-tight sm:text-4xl">
            SHOP BY CATEGORY
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {homeCategories.map((cat, i) => {
              const meta = getMeta(cat.name);
              return (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl" onClick={() => handleCategoryClick(cat.name)}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
                    <Image src={cat.image || meta.image} alt={meta.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 640px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white sm:text-2xl">{meta.title}</h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:scale-110">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {moreCategories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8 flex justify-center">
              <button onClick={() => setShowMore(true)} className="group flex items-center gap-3 rounded-full border-2 border-black/10 px-8 py-4 text-sm font-bold transition-all hover:border-black hover:bg-black hover:text-white">
                <Grid3X3 className="h-5 w-5 transition-transform group-hover:rotate-90" />Show More Categories
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>{showMore && <ShowMoreSheet categories={moreCategories} onClose={() => setShowMore(false)} onSelect={handleCategoryClick} />}</AnimatePresence>
      <AnimatePresence>{activeCategory && <CategorySheet title={activeCategory} products={filteredProducts} onClose={() => setActiveCategory(null)} onProductClick={(p) => setDetailProduct(p)} />}</AnimatePresence>
      <AnimatePresence>{detailProduct && <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />}</AnimatePresence>
    </>
  );
}
