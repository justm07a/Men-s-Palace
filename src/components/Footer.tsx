"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [discount, setDiscount] = useState("15");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.newsletter_enabled === "false") setShowNewsletter(false);
        if (data.newsletter_discount) setDiscount(data.newsletter_discount);
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage(`You're subscribed! Your ${discount}% discount will apply at checkout`);
        setEmail("");
      } else if (res.status === 404) {
        setMessage("Email not found. Please create an account first.");
      } else {
        const data = await res.json();
        setMessage(data.message || "You're already subscribed!");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <footer className="bg-[#0a0a0a] text-white">
      {/* Newsletter */}
      {showNewsletter && (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black to-black/80 p-8 sm:p-16"
          >
            <span className="absolute -right-10 -top-10 text-[200px] font-black leading-none text-white/[0.03]">
              MP
            </span>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl font-black sm:text-4xl">
                GET {discount}% OFF YOUR FIRST ORDER
              </h2>
              <p className="mt-3 text-sm text-white/50">
                Subscribe to our newsletter and receive exclusive early access to
                new drops, sales, and style guides.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/30"
                />
                <button
                  onClick={handleSubscribe}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-white/90"
                >
                  SUBSCRIBE
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {message && (
                <p className="mt-3 text-sm text-white/70">{message}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Marquee */}
      <div className="overflow-hidden border-t border-white/10 py-3">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {Array(8)
            .fill("MEN'S PALACE")
            .map((text, i) => (
              <span
                key={i}
                className="mx-8 text-xs font-bold uppercase tracking-[0.3em] text-white/20"
              >
                {text}
              </span>
            ))}
        </motion.div>
      </div>

      {/* Footer Columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="/logo.jpg"
                  alt="Men's Palace"
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <span className="text-lg font-bold tracking-widest">
                MEN&apos;S PALACE
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Premium streetwear crafted for the modern gentleman. Where luxury
              meets urban edge.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-3">
              {["New Arrivals", "Outerwear", "Hoodies", "Accessories", "Sale"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/40 transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Brand */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">
              Brand
            </h4>
            <ul className="space-y-3">
              {["Our Story", "Lookbook", "Sustainability", "Careers"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/40 transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Shipping Policy", "Returns"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/40 transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            &copy; 2026 Men&apos;s Palace. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Instagram", "Twitter", "TikTok"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-white/30 transition-colors hover:text-white"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Background Typography - no extra margin below */}
      <div className="overflow-hidden px-4 pb-0 text-center">
        <span className="text-[60px] font-black uppercase leading-none text-white/[0.03] sm:text-[100px] lg:text-[140px]">
          MEN&apos;S PALACE
        </span>
      </div>
    </footer>
  );
}
