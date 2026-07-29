"use client";

import { useEffect, useState } from "react";

export default function GlowSettings() {
  const [css, setCss] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const color = data.glow_color || "#D4AF37";
        const rawOpacity = data.glow_opacity ? Number(data.glow_opacity) / 100 : 0.07;
        const enabled = data.glow_enabled !== "false";
        const opacity = enabled ? rawOpacity : 0;

        setCss(`
          :root {
            --glow-color: ${color};
            --glow-intensity: ${opacity};
          }
          #hero-glow {
            background-color: ${color} !important;
            opacity: ${opacity} !important;
          }
          .glow-gold {
            box-shadow: 0 0 60px ${color}${hexOpacity(opacity)}, 0 0 120px ${color}${hexOpacity(opacity * 0.5)} !important;
          }
          .glow-gold-strong {
            box-shadow: 0 0 40px ${color}${hexOpacity(opacity * 1.5)}, 0 0 80px ${color}${hexOpacity(opacity)} !important;
          }
        `);
      })
      .catch(() => {});
  }, []);

  if (!css) return null;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function hexOpacity(opacity: number): string {
  const clamped = Math.max(0, Math.min(1, opacity));
  return Math.round(clamped * 255).toString(16).padStart(2, "0");
}
