"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  Check,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
} from "lucide-react";
import Image from "next/image";
import { useCartContext } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

const genieSpring = { type: "spring" as const, stiffness: 350, damping: 25, mass: 0.8 };

/* ─── Mini Auth (glass card inside drawer) ─── */
function MiniAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
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
        const endpoint =
          mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
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
        onSuccess();
        onClose();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [mode, name, email, password, onClose, onSuccess]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={genieSpring}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl"
    >
      <div className="liquid-glass-modal w-full max-w-sm rounded-3xl p-6 mx-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-white">
              {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
            </h3>
            <p className="mt-1 text-xs text-white/40">
              {mode === "login"
                ? "Sign in to complete checkout"
                : "Create an account to place your order"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-white/70 transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-red-500/20 p-3 text-xs text-red-300">
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-white/90 disabled:opacity-50"
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

        <p className="mt-4 text-center text-xs text-white/30">
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
      </div>
    </motion.div>
  );
}

/* ─── Success Toast ─── */
function SuccessToast({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed left-1/2 top-4 z-[200] -translate-x-1/2 rounded-2xl bg-green-600 px-6 py-4 text-white shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Check className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold">Order Placed Successfully!</p>
          <p className="text-xs text-white/80">Order #{orderId.slice(0, 8)}...</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   CART DRAWER
   ═══════════════════════════════════════ */
export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isOpen,
    closeCart,
  } = useCartContext();

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const isLoggedIn =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  const handleCheckout = useCallback(() => {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    setCheckoutMode(true);
  }, [isLoggedIn]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuth(false);
    setCheckoutMode(true);
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!shippingAddress.trim() || !shippingPhone.trim()) return;
    setPlacing(true);
    try {
      const token = localStorage.getItem("token");
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
      }));
      const fullAddress = `${shippingAddress.trim()} | Phone: ${shippingPhone.trim()}`;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: orderItems, shippingAddress: fullAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to place order");
        return;
      }
      setSuccessOrder(data.id);
      clearCart();
      setCheckoutMode(false);
      setShippingAddress("");
      setShippingPhone("");
      closeCart();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  }, [items, shippingAddress, shippingPhone, clearCart, closeCart]);

  const handleDrawerClose = useCallback(() => {
    setCheckoutMode(false);
    setShowAuth(false);
    closeCart();
  }, [closeCart]);

  return (
    <>
      <AnimatePresence>
        {successOrder && (
          <SuccessToast
            orderId={successOrder}
            onClose={() => setSuccessOrder(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
              onClick={handleDrawerClose}
            />

            {/* Glass Sheet Drawer — Genie from right */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={genieSpring}
              className="liquid-glass-sheet fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col"
            >
              {/* Auth overlay inside drawer */}
              <AnimatePresence>
                {showAuth && (
                  <MiniAuthModal
                    isOpen={showAuth}
                    onClose={() => setShowAuth(false)}
                    onSuccess={handleAuthSuccess}
                  />
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {checkoutMode ? "CHECKOUT" : "YOUR CART"}
                  </h2>
                  <p className="text-xs text-white/40">
                    {checkoutMode
                      ? "Enter shipping details"
                      : `${totalItems} ${totalItems === 1 ? "item" : "items"}`}
                  </p>
                </div>
                <button
                  onClick={handleDrawerClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              {checkoutMode ? (
                /* Checkout Form */
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-white/50">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="liquid-glass-input w-full rounded-xl px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-white/50">
                        Shipping Address
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Street, City, Governorate"
                        rows={3}
                        className="liquid-glass-input w-full resize-none rounded-xl px-4 py-3 text-sm"
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="mb-3 text-xs font-bold text-white/40">
                        ORDER SUMMARY
                      </p>
                      {items.map((item) => (
                        <div
                          key={`${item.product.id}-${item.size}`}
                          className="flex items-center justify-between py-1.5 text-sm"
                        >
                          <span className="text-white/70">
                            {item.product.title}{" "}
                            <span className="text-white/30">
                              ×{item.quantity} ({item.size})
                            </span>
                          </span>
                          <span className="font-bold text-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">
                            Total
                          </span>
                          <span className="text-lg font-black text-white">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      onClick={() => setCheckoutMode(false)}
                      className="rounded-xl border border-white/15 py-3.5 text-sm font-bold text-white/70 transition hover:bg-white/10"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={
                        placing || !shippingAddress.trim() || !shippingPhone.trim()
                      }
                      className="flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-white/90 hover:shadow-lg disabled:opacity-40"
                    >
                      {placing ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          PLACE ORDER — {formatPrice(totalPrice)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Cart Items */
                <>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-6xl opacity-20">🛒</div>
                        <p className="mt-4 text-sm font-medium text-white/30">
                          Your cart is empty
                        </p>
                        <button
                          onClick={handleDrawerClose}
                          className="mt-4 text-sm font-bold text-white underline underline-offset-4"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <AnimatePresence>
                          {items.map((item) => (
                            <motion.div
                              key={`${item.product.id}-${item.size}`}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex gap-4"
                            >
                              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
                                {item.product.image ? (
                                  <Image
                                    src={item.product.image}
                                    alt={item.product.title}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-white/20">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-1 flex-col justify-between">
                                <div>
                                  <h3 className="text-sm font-bold leading-tight text-white">
                                    {item.product.title}
                                  </h3>
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                                    Size: {item.size}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 rounded-lg border border-white/15">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.size,
                                          item.quantity - 1
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center text-white/60 transition-colors hover:bg-white/10"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold text-white">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.size,
                                          item.quantity + 1
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center text-white/60 transition-colors hover:bg-white/10"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-white">
                                      {formatPrice(
                                        item.product.price * item.quantity
                                      )}
                                    </span>
                                    <button
                                      onClick={() =>
                                        removeItem(item.product.id, item.size)
                                      }
                                      className="text-white/20 transition-colors hover:text-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {items.length > 0 && (
                    <div className="border-t border-white/10 px-6 py-5">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-white/50">Subtotal</span>
                      <span className="text-lg font-bold text-white">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full rounded-2xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-white/90 hover:shadow-lg"
                      >
                        CHECKOUT NOW
                      </button>
                      <p className="mt-3 text-center text-[10px] text-white/25">
                        Shipping & taxes calculated at checkout
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
