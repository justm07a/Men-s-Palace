"use client";

import { motion } from "framer-motion";

const items = [
  "MEN'S PALACE",
  "URBAN ELEGANCE",
  "PREMIUM DROPS",
  "EXCLUSIVE QUALITY",
  "MEN'S PALACE",
  "URBAN ELEGANCE",
  "PREMIUM DROPS",
  "EXCLUSIVE QUALITY",
];

export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-black/10 bg-black py-4">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm font-bold uppercase tracking-[0.25em] text-white/90"
          >
            {item} •
          </span>
        ))}
      </motion.div>
    </div>
  );
}
