"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useSiteContent } from "@/lib/site-content";

export default function Hero() {
  const c = useSiteContent();
  return (
    <section id="hero" className="relative overflow-hidden bg-[#f5f5f0] pt-20 lg:pt-24">
      <div
        id="hero-glow"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full blur-[120px]"
        style={{
          backgroundColor: "var(--glow-color, #D4AF37)",
          opacity: "var(--glow-intensity, 0.07)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]/70"
            >
              {c.hero_badge}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-black leading-[0.95] tracking-tight text-black sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              {c.hero_title_line1}
              <br />
              {c.hero_title_line2}
              <br />
              <span className="text-black/40">{c.hero_title_highlight}</span> {c.hero_title_suffix}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-6 max-w-md text-base text-black/60 lg:mx-0 lg:text-lg"
            >
              {c.hero_subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <a
                href="#shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-black/80 hover:shadow-lg"
              >
                {c.hero_btn_primary}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#categories"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-black px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-black hover:text-white"
              >
                {c.hero_btn_secondary}
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative order-1 mx-auto w-full max-w-sm lg:order-2"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-black/5">
              <Image
                src="/logo.jpg"
                alt="Men's Palace Featured"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute -left-4 bottom-20 rounded-2xl bg-white px-5 py-3 shadow-xl sm:-left-8"
            >
              <p className="text-[10px] uppercase tracking-wider text-black/50">Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">4.9</span>
                <span className="text-xs text-yellow-500">★★★★★</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="absolute -right-4 top-10 rounded-2xl bg-black px-5 py-3 text-white shadow-xl sm:-right-8"
            >
              <p className="text-[10px] uppercase tracking-wider text-white/60">Trending</p>
              <p className="text-sm font-bold">#1 OUTERWEAR</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
