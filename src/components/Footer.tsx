"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/lib/site-content";

export default function Footer() {
  const c = useSiteContent();
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="overflow-hidden border-t border-white/10 py-3">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 25, ease: "linear" } }}
        >
          {Array(8).fill("MEN'S PALACE").map((text, i) => (
            <span key={i} className="mx-8 text-xs font-bold uppercase tracking-[0.3em] text-white/20">{text}</span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image src="/logo.jpg" alt="Men's Palace" fill className="object-cover" sizes="32px" />
              </div>
              <span className="text-lg font-bold tracking-widest">MEN&apos;S PALACE</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">{c.footer_tagline}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">{c.footer_shop}</h4>
            <ul className="space-y-3">
              {["New Arrivals", "Outerwear", "Hoodies", "Accessories", "Sale"].map((link) => (
                <li key={link}><Link href="#" className="text-sm text-white/40 transition-colors hover:text-white">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">{c.footer_brand}</h4>
            <ul className="space-y-3">
              {["Our Story", "Lookbook", "Sustainability", "Careers"].map((link) => (
                <li key={link}><Link href="#" className="text-sm text-white/40 transition-colors hover:text-white">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">{c.footer_legal}</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Shipping Policy", "Returns"].map((link) => (
                <li key={link}><Link href="#" className="text-sm text-white/40 transition-colors hover:text-white">{link}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">{c.footer_copyright}</p>
          <div className="flex gap-6">
            {["Instagram", "Twitter", "TikTok"].map((social) => (
              <Link key={social} href="#" className="text-xs text-white/30 transition-colors hover:text-white">{social}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden px-4 pb-0 text-center">
        <span className="text-[60px] font-black uppercase leading-none text-white/[0.03] sm:text-[100px] lg:text-[140px]">MEN&apos;S PALACE</span>
      </div>
    </footer>
  );
}
