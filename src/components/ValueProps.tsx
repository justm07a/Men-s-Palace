"use client";

import { motion } from "framer-motion";
import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";

const icons = [Truck, RotateCcw, ShieldCheck, Headphones];

export default function ValueProps() {
  const c = useSiteContent();
  const features = [
    { num: "01", icon: icons[0], title: c.features_1_title, desc: c.features_1_desc },
    { num: "02", icon: icons[1], title: c.features_2_title, desc: c.features_2_desc },
    { num: "03", icon: icons[2], title: c.features_3_title, desc: c.features_3_desc },
    { num: "04", icon: icons[3], title: c.features_4_title, desc: c.features_4_desc },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-3xl font-black tracking-tight sm:text-4xl"
        >
          {c.features_title}
        </motion.h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-[#f5f5f0] p-6 transition-shadow hover:shadow-lg sm:rounded-3xl sm:p-8"
            >
              <span className="absolute -right-2 -top-4 text-[120px] font-black leading-none text-black/[0.03]">
                {feat.num}
              </span>
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition-transform group-hover:scale-110">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/50">
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
