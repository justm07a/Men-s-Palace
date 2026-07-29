"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, Minus, Eye, ShoppingCart, ImageIcon } from "lucide-react";
import Image from "next/image";
import { parseDBProduct, filterCategories } from "@/lib/db-products";
import type { Product } from "@/lib/types";
import { useCartContext } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

function ProductCard({ product, onQuickView }: { product: Product; onQuickView: (p: Product) => void }) {
  const cardScale = product.cardScale || 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative cursor-pointer"
      onClick={() => onQuickView(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f0f0ec] sm:rounded-3xl">
        {product.image ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `scale(${cardScale})` }}
          >
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-black/10" />
          </div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:left-4 sm:top-4">
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:left-4 sm:top-4">
            OUT OF STOCK
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10">
          <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110"
              aria-label="Quick view"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 px-1 sm:mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-black/40 sm:text-xs">
          {product.category}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-tight sm:text-base">
          {product.title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold sm:text-base">EGP {product.price.toLocaleString()}</span>
          {product.discountPrice && (
            <span className="text-xs text-black/40 line-through">
              EGP {product.discountPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const { addItem } = useCartContext();

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "M");
      setQuantity(1);
      setActiveImageIndex(0);
      setDescExpanded(false);
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (product) {
      addItem(product, selectedSize, quantity);
      onClose();
    }
  }, [product, selectedSize, quantity, addItem, onClose]);

  const allImages = product?.images || [];
  const hasMultipleImages = allImages.length > 1;
  const detailsScale = product?.detailsScale || 1;
  const description = product?.description || "";
  const needsTruncate = description.length > 60;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-3 inset-y-3 z-[90] mx-auto my-auto flex max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-8 sm:inset-y-8"
          >
            <div className="flex h-full flex-col overflow-hidden sm:grid sm:grid-cols-2">
              {/* Image Section */}
              <div className="relative flex min-h-[280px] flex-col bg-[#f0f0ec] sm:flex-1">
                <div className="relative flex-1 min-h-0">
                  {allImages[activeImageIndex] ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ transform: `scale(${detailsScale})` }}
                    >
                      <Image
                        src={allImages[activeImageIndex]}
                        alt={product.title}
                        fill
                        className="object-contain p-4"
                        sizes="50vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-black/10" />
                    </div>
                  )}
                </div>
                {hasMultipleImages && (
                  <div className="flex gap-2 overflow-x-auto px-3 py-2">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={cn(
                          "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                          i === activeImageIndex
                            ? "border-black"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details section - scrollable */}
              <div className="flex flex-col overflow-y-auto overscroll-contain p-5 sm:p-8">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/40">
                    {product.category}
                  </p>
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-sm transition-colors hover:bg-black/10"
                  >
                    ✕
                  </button>
                </div>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  {product.title}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xl font-bold">EGP {product.price.toLocaleString()}</span>
                  {product.discountPrice && (
                    <span className="text-sm text-black/40 line-through">
                      EGP {product.discountPrice.toLocaleString()}
                    </span>
                  )}
                </div>

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
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "flex h-10 min-w-[40px] items-center justify-center rounded-xl border-2 px-3 text-xs font-bold transition-all",
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-black/10 hover:border-black/30"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider">Quantity</p>
                  <div className="flex items-center rounded-xl border-2 border-black/10 w-fit">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-black/5">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-black/5">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-6 pb-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-bold text-white transition-all hover:bg-black/80 disabled:opacity-40"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
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

export default function ProductCatalog() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.map(parseDBProduct));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setActiveFilter(e.detail);
    };
    window.addEventListener("category-select", handler as EventListener);
    return () => window.removeEventListener("category-select", handler as EventListener);
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "ALL") return products;
    return products.filter((p) => p.category === activeFilter);
  }, [activeFilter, products]);

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const handleClose = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  return (
    <section id="arrivals" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center text-3xl font-black tracking-tight sm:text-4xl"
          id="shop"
        >
          NEW ARRIVALS
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-10 max-w-md text-center text-sm text-black/50 sm:mb-14"
        >
          Explore our latest drops curated for the discerning gentleman
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "rounded-full px-5 py-2.5 text-xs font-bold tracking-wide transition-all sm:px-6 sm:py-3 sm:text-sm",
                activeFilter === cat
                  ? "bg-black text-white shadow-lg"
                  : "bg-black/5 text-black/60 hover:bg-black/10"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-2xl bg-black/5 sm:rounded-3xl" />
                <div className="mt-3 space-y-2 px-1">
                  <div className="h-3 w-16 rounded bg-black/5" />
                  <div className="h-4 w-32 rounded bg-black/5" />
                  <div className="h-4 w-20 rounded bg-black/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <LayoutGroup>
            <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="sale"
          className="mt-16 overflow-hidden rounded-3xl bg-black p-8 text-center sm:mt-24 sm:p-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Limited Time Offer
          </p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
            UP TO 30% OFF
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
            Premium outerwear at exceptional prices. Don&apos;t miss out on our exclusive seasonal sale.
          </p>
          <a
            href="#shop"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:bg-white/90 hover:shadow-lg"
          >
            SHOP THE SALE
          </a>
        </motion.div>
      </div>

      <QuickViewModal product={quickViewProduct} onClose={handleClose} />
    </section>
  );
}
