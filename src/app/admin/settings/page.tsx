"use client";

import { useEffect, useState, useCallback } from "react";
import { Save } from "lucide-react";

export default function AdminSettings() {
  const [glowColor, setGlowColor] = useState("#D4AF37");
  const [glowOpacity, setGlowOpacity] = useState(12);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [newsletterDiscount, setNewsletterDiscount] = useState(15);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.glow_color) setGlowColor(data.glow_color);
        if (data.glow_opacity) setGlowOpacity(parseInt(data.glow_opacity));
        if (data.glow_enabled !== undefined) setGlowEnabled(data.glow_enabled === "true");
        if (data.newsletter_enabled !== undefined) setNewsletterEnabled(data.newsletter_enabled === "true");
        if (data.newsletter_discount) setNewsletterDiscount(parseInt(data.newsletter_discount));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    await Promise.all([
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "glow_color", value: glowColor }) }),
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "glow_opacity", value: String(glowOpacity) }) }),
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "glow_enabled", value: String(glowEnabled) }) }),
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "newsletter_enabled", value: String(newsletterEnabled) }) }),
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "newsletter_discount", value: String(newsletterDiscount) }) }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [glowColor, glowOpacity, glowEnabled, newsletterEnabled, newsletterDiscount]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Brand settings and visual configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50">
          <Save className="h-4 w-4" />{saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* ═══ Glow Settings ═══ */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Ambient Glow Effect</h2>
            <p className="mt-1 text-sm text-gray-400">Control the luxury glow behind the hero section and featured cards</p>
          </div>
          <button type="button" onClick={() => setGlowEnabled(!glowEnabled)} className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${glowEnabled ? "bg-black" : "bg-gray-200"}`} role="switch" aria-checked={glowEnabled}>
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${glowEnabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        {glowEnabled && (
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-3 block text-xs font-bold text-gray-500">Glow Color</label>
              <div className="flex items-center gap-4">
                <input type="color" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} className="h-12 w-12 cursor-pointer rounded-xl border-2 border-gray-200" />
                <input type="text" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} className="w-32 rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm outline-none transition focus:border-black" />
                <div className="h-12 w-12 rounded-xl" style={{ background: glowColor, opacity: glowOpacity / 50, boxShadow: `0 0 40px ${glowColor}` }} />
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500">Intensity</label>
                <span className="text-xs font-bold text-gray-400">{glowOpacity}%</span>
              </div>
              <input type="range" min={0} max={50} value={glowOpacity} onChange={(e) => setGlowOpacity(parseInt(e.target.value))} className="w-full cursor-pointer accent-black" />
              <div className="mt-1 flex justify-between text-[10px] text-gray-300"><span>0%</span><span>25%</span><span>50%</span></div>
            </div>
            <div>
              <label className="mb-3 block text-xs font-bold text-gray-500">Preview</label>
              <div className="relative overflow-hidden rounded-2xl bg-[#f5f5f0] p-12 text-center">
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" style={{ width: 400, height: 300, backgroundColor: glowColor, opacity: glowOpacity / 100 }} />
                <p className="relative text-2xl font-black text-black/80">ELEVATE YOUR STYLE</p>
                <p className="relative mt-2 text-sm text-black/40">Ambient glow preview at {glowOpacity}% intensity</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Newsletter Section ═══ */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Newsletter Section</h2>
            <p className="mt-1 text-sm text-gray-400">Configure the newsletter signup banner and discount offer</p>
          </div>
          <button type="button" onClick={() => setNewsletterEnabled(!newsletterEnabled)} className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${newsletterEnabled ? "bg-black" : "bg-gray-200"}`} role="switch" aria-checked={newsletterEnabled}>
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${newsletterEnabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        {newsletterEnabled && (
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-3 block text-xs font-bold text-gray-500">Discount Percentage</label>
              <div className="flex items-center gap-4">
                <input type="number" min={0} max={100} value={newsletterDiscount} onChange={(e) => setNewsletterDiscount(parseInt(e.target.value) || 0)} className="w-32 rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm outline-none transition focus:border-black" />
                <span className="text-sm text-gray-400">% off first purchase</span>
              </div>
            </div>
            <div>
              <label className="mb-3 block text-xs font-bold text-gray-500">Preview</label>
              <div className="relative overflow-hidden rounded-2xl bg-[#f5f5f0] p-12 text-center">
                <p className="relative text-2xl font-black text-black/80">JOIN THE CLUB</p>
                <p className="relative mt-2 text-sm text-black/40">Get <span className="font-bold text-black">{newsletterDiscount}%</span> off your first purchase</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
