"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Menu,
  X,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Home,
  Search,
  LogOut,
  Package,
  ChevronDown,
  Truck,
  MessageCircle,
  Phone,
  ExternalLink,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/products";

const navLinks = [
  { label: "Shop", href: "#shop" },
  { label: "New Arrivals", href: "#arrivals" },
  { label: "Outerwear", href: "#categories" },
  { label: "Sale", href: "#sale" },
];

const mobileTabs = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "cart", label: "Cart", icon: ShoppingBag },
  { id: "menu", label: "Menu", icon: Menu },
];

/* ─── Genie spring config ─── */
const genieSpring = { type: "spring" as const, stiffness: 350, damping: 25, mass: 0.8 };
const genieOrigin = { transformOrigin: "bottom center" };

/* ─── Glass Auth Modal (compact card) ─── */
function AuthModal({
  isOpen,
  onClose,
  originRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  originRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
        const body =
          mode === "signup" ? { name, email, password } : { email, password };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose();
        window.location.reload();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [mode, name, email, password, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.2, y: 100, ...genieOrigin }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.2, y: 100 }}
            transition={genieSpring}
            className="liquid-glass-modal fixed left-1/2 top-1/2 z-[90] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-white">
                  {mode === "login" ? "WELCOME BACK" : "JOIN THE PALACE"}
                </h2>
                <p className="mt-1 text-xs text-white/50">
                  {mode === "login"
                    ? "Sign in to your account"
                    : "Create your account"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="liquid-glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="liquid-glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="liquid-glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? (
                  "Please wait..."
                ) : mode === "login" ? (
                  <>
                    <LogIn className="h-4 w-4" /> SIGN IN
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> CREATE ACCOUNT
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-white/40">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="font-bold text-white underline underline-offset-4"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Floating Search Overlay ─── */
function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; title: string; price: number; image: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query.trim())}&limit=6`);
        const data = await res.json();
        setResults(data.products || data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 80, transformOrigin: "bottom center" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: 80 }}
            transition={genieSpring}
            className="liquid-glass-modal fixed bottom-24 left-4 right-4 z-[90] mx-auto max-w-lg overflow-hidden rounded-3xl p-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="liquid-glass-input w-full rounded-2xl py-3.5 pl-11 pr-10 text-sm"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {(results.length > 0 || loading) && (
              <div className="mt-3 max-h-64 overflow-y-auto border-t border-white/10 pt-3">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/10"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
                          {p.image ? (
                            <Image src={p.image} alt={p.title} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-4 w-4 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-white">{p.title}</p>
                          <p className="text-xs text-white/50">EGP {p.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {query && !loading && results.length === 0 && (
              <p className="mt-3 text-center text-xs text-white/30">No products found</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Track Orders Modal ─── */
function TrackOrdersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [orders, setOrders] = useState<Array<{
    id: string; totalPrice: number; orderStatus: string; createdAt: string;
    originalTotal?: number | null; discountPercent?: number | null;
    items: Array<{ quantity: number; size: string; unitPrice: number; product: { title: string } }>;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const token = localStorage.getItem("token");
      fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.2, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.2, y: 100 }}
            transition={genieSpring}
            className="liquid-glass-modal fixed inset-x-3 bottom-3 top-12 z-[90] mx-auto flex max-w-lg flex-col overflow-hidden rounded-3xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] sm:max-h-[80vh]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold text-white">TRACK ORDERS</h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" /></div>
              ) : orders.length === 0 ? (
                <p className="text-center text-sm text-white/40 py-10">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const currentStep = statusSteps.indexOf(order.orderStatus);
                    return (
                      <div key={order.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/40">#{order.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-white/30">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            {order.discountPercent ? (
                              <div>
                                <span className="text-[10px] text-white/30 line-through">{formatPrice(order.originalTotal || 0)}</span>
                                <span className="text-sm font-bold text-white ml-2">{formatPrice(order.totalPrice)}</span>
                                <span className="text-[10px] text-green-400 ml-1">-{order.discountPercent}%</span>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-white">{formatPrice(order.totalPrice)}</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1">
                          {statusSteps.map((step, i) => (
                            <div key={step} className="flex flex-1 items-center gap-1">
                              <div className={`h-2 flex-1 rounded-full ${i <= currentStep ? "bg-white/60" : "bg-white/10"}`} />
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 flex justify-between">
                          {statusSteps.map((step) => (
                            <span key={step} className={`text-[9px] font-bold capitalize ${order.orderStatus === step ? "text-white" : "text-white/25"}`}>{step}</span>
                          ))}
                        </div>
                        <div className="mt-3 border-t border-white/10 pt-2">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-[11px] text-white/50">{item.product.title} ×{item.quantity} ({item.size})</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── SVG Social Icons ─── */
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const MapIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/* ─── Contact Us Modal ─── */
function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const WHATSAPP_NUMBER = "+201029705158";
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`;
  const socials = [
    { name: "WhatsApp", icon: <WhatsAppIcon className="h-5 w-5" />, href: WHATSAPP_LINK, color: "bg-green-500/15 text-green-400 border-green-500/20" },
    { name: "Instagram", icon: <InstagramIcon className="h-5 w-5" />, href: "https://www.instagram.com/menspalace0?igsh=N3k4YXJxNmx2bDhk", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
    { name: "Facebook", icon: <FacebookIcon className="h-5 w-5" />, href: "https://www.facebook.com/share/1GJx7zJaAV/", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    { name: "TikTok", icon: <TikTokIcon className="h-5 w-5" />, href: "https://www.tiktok.com/@menspalace?_r=1&_t=ZS-98QBg0vCtGS", color: "bg-white/10 text-white/70 border-white/15" },
    { name: "Location", icon: <MapIcon className="h-5 w-5" />, href: "https://www.google.com/maps/place/HFRP+VC3+Men's+palace,+%D8%B7%D8%B1%D9%8A%D9%82+%D8%BA%D8%B4%D8%A7%D9%85%D8%8C+%D8%B4%D9%8A%D8%A8%D8%A9+%D8%A7%D9%84%D9%86%D9%83%D8%A7%D8%B1%D9%8A%D8%A9%D8%8C+%D8%A7%D9%84%D8%B2%D9%82%D8%A7%D8%B2%D9%8A%D9%82%D8%8C+%D9%85%D8%AD%D8%A7%D9%81%D8%B8%D8%A9+%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9+7120044%E2%80%AD/@30.592135,31.4860526,16z", color: "bg-red-500/15 text-red-400 border-red-500/20" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.2, y: 100, transformOrigin: "bottom center" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.2, y: 100 }}
            transition={genieSpring}
            className="liquid-glass-modal fixed left-1/2 top-1/2 z-[90] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-white">CONTACT US</h2>
                <p className="mt-1 text-xs text-white/50">We&apos;re here to help</p>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${s.color}`}
                >
                  {s.icon}
                  <span className="flex-1 text-sm font-bold">{s.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════ */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [trackOrdersOpen, setTrackOrdersOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const { totalItems, toggleCart } = useCartContext();

  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || authOpen || searchOpen || userMenuOpen || contactOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, authOpen, searchOpen, userMenuOpen, contactOpen]);

  const handleNavClick = useCallback(() => setMobileOpen(false), []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  }, []);

  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      if (tabId === "cart") {
        toggleCart();
      } else if (tabId === "search") {
        setSearchOpen(true);
      } else if (tabId === "menu") {
        setMobileOpen(true);
      }
    },
    [toggleCart]
  );

  return (
    <>
      {/* ═══ DESKTOP HEADER ═══ */}
      <header
        className="sticky top-0 z-50 hidden md:block border-b border-black/5"
        style={{
          backgroundColor: 'rgba(248, 246, 240, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full lg:h-10 lg:w-10">
                <Image src="/logo.jpg" alt="Men's Palace" fill className="object-cover" priority />
              </div>
              <span className="text-lg font-bold tracking-widest lg:text-xl">
                MEN&apos;S PALACE
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black/70 transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => setContactOpen(true)}
                className="rounded-full border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black/70 transition-all hover:border-black hover:bg-black hover:text-white"
              >
                Contact Us
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="rounded-full bg-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:bg-black/80"
                    >
                      Admin
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 rounded-full border border-black/10 p-1.5 pr-3 transition-all hover:bg-black/5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <ChevronDown className={cn("h-3.5 w-3.5 text-black/40 transition-transform", userMenuOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[49]" onClick={() => setUserMenuOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl"
                          >
                            <div className="border-b border-black/5 px-4 py-3">
                              <p className="text-sm font-bold text-black truncate">{user.name}</p>
                              <p className="text-[11px] text-black/40 truncate">{user.email}</p>
                            </div>
                            {user.role === "admin" && (
                              <Link
                                href="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-black/70 transition-colors hover:bg-black/5"
                              >
                                <Package className="h-4 w-4" /> Admin Dashboard
                              </Link>
                            )}
                            <button
                              onClick={() => { setUserMenuOpen(false); setTrackOrdersOpen(true); }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-black/70 transition-colors hover:bg-black/5"
                            >
                              <Truck className="h-4 w-4" /> Track Orders
                            </button>
                            <button
                              onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="p-2"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </button>
              )}
              <button
                ref={cartBtnRef}
                onClick={toggleCart}
                className="relative p-2"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE BOTTOM GRADIENT ═══ */}
      <div className="fixed bottom-0 left-0 right-0 h-36 z-[45] bg-gradient-to-t from-black/45 to-transparent pointer-events-none md:hidden" />

      {/* ═══ MOBILE LIQUID GLASS — SIDE-BY-SIDE PILL + ACCOUNT ═══ */}
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 flex flex-row items-center justify-center gap-3 w-auto max-w-[95vw] md:hidden">
        {/* Main Pill */}
        <div className="flex-1 flex items-center justify-around bg-black/30 backdrop-blur-2xl border border-white/15 rounded-full px-4 py-2.5 shadow-2xl">
          {mobileTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isCart = tab.id === "cart";
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full transition-colors active:scale-90"
                )}
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStoreTab"
                    className="absolute inset-0 rounded-full bg-white/20"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      mass: 0.8,
                    }}
                  />
                )}
                <div className="relative z-10">
                  <tab.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-white/50"
                  )} />
                  {isCart && totalItems > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[8px] font-black text-black">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detached Account Button — beside pill */}
        <button
          ref={accountBtnRef}
          onClick={() => {
            if (user) {
              handleLogout();
            } else {
              setAuthOpen(true);
            }
          }}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-2xl border border-white/15 shadow-xl active:scale-90 transition-transform"
          aria-label="Account"
        >
          {user ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
          ) : (
            <User className="h-5 w-5 text-white/90" />
          )}
        </button>

        {/* Detached Contact Button — beside account */}
        <button
          onClick={() => setContactOpen(true)}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-2xl border border-white/15 shadow-xl active:scale-90 transition-transform"
          aria-label="Contact Us"
        >
          <MessageCircle className="h-5 w-5 text-white/90" />
        </button>
      </div>

      {/* ═══ MOBILE DRAWER ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={handleNavClick}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="liquid-glass-sheet fixed inset-y-0 left-0 z-[70] w-full max-w-sm md:hidden"
            >
              <div className="flex h-full flex-col p-6">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-lg font-bold tracking-widest text-white">
                    MEN&apos;S PALACE
                  </span>
                  <button onClick={handleNavClick} aria-label="Close menu">
                    <X className="h-6 w-6 text-white/70" />
                  </button>
                </div>
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={handleNavClick}
                      className="text-2xl font-bold tracking-wide text-white/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex gap-6 border-t border-white/10 pt-6">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <span className="text-sm font-medium text-white/70">
                        Hi, {user.name?.split(" ")[0]}
                      </span>
                      {user.role === "admin" && (
                        <Link href="/admin" onClick={handleNavClick} className="text-sm font-bold text-white">
                          Admin Dashboard →
                        </Link>
                      )}
                      <button onClick={() => { handleNavClick(); setTrackOrdersOpen(true); }} className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <Truck className="h-4 w-4" /> Track Orders
                      </button>
                      <button onClick={handleLogout} className="text-sm text-white/40">
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { handleNavClick(); setAuthOpen(true); }}
                      className="flex items-center gap-2 text-sm font-medium text-white/70"
                    >
                      <User className="h-4 w-4" /> Account
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal (Genie from account button) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        originRef={accountBtnRef}
      />

      {/* Search Overlay (Genie from search tab) */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Track Orders Modal */}
      <TrackOrdersModal
        isOpen={trackOrdersOpen}
        onClose={() => setTrackOrdersOpen(false)}
      />

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </>
  );
}
