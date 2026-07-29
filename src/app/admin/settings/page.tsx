"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Shield, Type, ChevronDown, ChevronUp } from "lucide-react";
import { CONTENT_DEFAULTS } from "@/lib/site-content";

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-gray-500">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || CONTENT_DEFAULTS[label] || ""} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-black" />
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = false }: { title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-6 text-left">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100 px-6 pb-6 pt-4">{children}</div>}
    </div>
  );
}

export default function AdminSettings() {
  const [glowColor, setGlowColor] = useState("#D4AF37");
  const [glowOpacity, setGlowOpacity] = useState(12);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [content, setContent] = useState<Record<string, string>>({ ...CONTENT_DEFAULTS });
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);

  const fetchSettings = useCallback(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.glow_color) setGlowColor(data.glow_color);
        if (data.glow_opacity) setGlowOpacity(parseInt(data.glow_opacity));
        if (data.glow_enabled !== undefined) setGlowEnabled(data.glow_enabled === "true");
        const merged = { ...CONTENT_DEFAULTS };
        for (const key of Object.keys(CONTENT_DEFAULTS)) {
          if (data[key] && typeof data[key] === "string" && data[key].trim()) {
            merged[key] = data[key];
          }
        }
        setContent(merged);
      })
      .catch(() => {});
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.email) setEmail(user.email);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleGlowSave = useCallback(async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    await Promise.all([
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "glow_color", value: glowColor }) }),
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "glow_opacity", value: String(glowOpacity) }) }),
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key: "glow_enabled", value: String(glowEnabled) }) }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [glowColor, glowOpacity, glowEnabled]);

  const handleContentSave = useCallback(async () => {
    setContentSaving(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const keys = Object.keys(CONTENT_DEFAULTS);
    await Promise.all(keys.map((key) =>
      fetch("/api/settings", { method: "PUT", headers, body: JSON.stringify({ key, value: content[key] || "" }) })
    ));
    setContentSaving(false);
    setContentSaved(true);
    setTimeout(() => setContentSaved(false), 3000);
  }, [content]);

  const updateContent = useCallback((key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleProfileUpdate = useCallback(async () => {
    setProfileError("");
    if (!currentPassword) { setProfileError("Current password is required"); return; }
    if (newPassword && newPassword.length < 6) { setProfileError("New password must be at least 6 characters"); return; }
    setProfileSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email || undefined, newPassword: newPassword || undefined, currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setProfileError(data.error || "Update failed"); return; }
      setProfileSaved(true);
      setNewPassword("");
      setCurrentPassword("");
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => setProfileSaved(false), 3000);
    } catch { setProfileError("Network error"); }
    setProfileSaving(false);
  }, [email, newPassword, currentPassword]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Brand settings, content, and visual configuration</p>
        </div>
      </div>

      {/* ═══ Glow Settings ═══ */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Ambient Glow Effect</h2>
            <p className="mt-1 text-sm text-gray-400">Control the luxury glow behind the hero section and featured cards</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setGlowEnabled(!glowEnabled)} className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${glowEnabled ? "bg-black" : "bg-gray-200"}`} role="switch" aria-checked={glowEnabled}>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${glowEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <button onClick={handleGlowSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-black/80 disabled:opacity-50">
              <Save className="h-3 w-3" />{saving ? "Saving..." : saved ? "Saved!" : "Save Glow"}
            </button>
          </div>
        </div>
        {glowEnabled && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <input type="color" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border-2 border-gray-200" />
              <input type="text" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} className="w-32 rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm outline-none transition focus:border-black" />
              <div className="h-10 w-10 rounded-xl" style={{ background: glowColor, opacity: glowOpacity / 50, boxShadow: `0 0 40px ${glowColor}` }} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500">Intensity</label>
                <span className="text-xs font-bold text-gray-400">{glowOpacity}%</span>
              </div>
              <input type="range" min={0} max={50} value={glowOpacity} onChange={(e) => setGlowOpacity(parseInt(e.target.value))} className="w-full cursor-pointer accent-black" />
            </div>
          </div>
        )}
      </div>

      {/* ═══ SITE CONTENT ═══ */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><Type className="h-5 w-5" /> Site Content</h2>
            <p className="mt-1 text-sm text-gray-500">Edit all storefront copy from one place</p>
          </div>
          <button onClick={handleContentSave} disabled={contentSaving} className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50">
            <Save className="h-4 w-4" />{contentSaving ? "Saving..." : contentSaved ? "Saved!" : "Save All Content"}
          </button>
        </div>

        {/* Hero Section */}
        <Section title="Hero Section" icon={<span className="text-xs font-bold text-gray-400">01</span>} defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="hero_badge" value={content.hero_badge} onChange={(v) => updateContent("hero_badge", v)} />
            <Field label="hero_title_line1" value={content.hero_title_line1} onChange={(v) => updateContent("hero_title_line1", v)} />
            <Field label="hero_title_line2" value={content.hero_title_line2} onChange={(v) => updateContent("hero_title_line2", v)} />
            <Field label="hero_title_highlight" value={content.hero_title_highlight} onChange={(v) => updateContent("hero_title_highlight", v)} />
            <Field label="hero_title_suffix" value={content.hero_title_suffix} onChange={(v) => updateContent("hero_title_suffix", v)} />
            <div className="sm:col-span-2">
              <Field label="hero_subtitle" value={content.hero_subtitle} onChange={(v) => updateContent("hero_subtitle", v)} />
            </div>
            <Field label="hero_btn_primary" value={content.hero_btn_primary} onChange={(v) => updateContent("hero_btn_primary", v)} />
            <Field label="hero_btn_secondary" value={content.hero_btn_secondary} onChange={(v) => updateContent("hero_btn_secondary", v)} />
          </div>
        </Section>

        {/* Categories & New Arrivals */}
        <Section title="Categories & New Arrivals" icon={<span className="text-xs font-bold text-gray-400">02</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="categories_title" value={content.categories_title} onChange={(v) => updateContent("categories_title", v)} />
            <Field label="categories_show_more" value={content.categories_show_more} onChange={(v) => updateContent("categories_show_more", v)} />
            <Field label="arrivals_title" value={content.arrivals_title} onChange={(v) => updateContent("arrivals_title", v)} />
            <Field label="arrivals_subtitle" value={content.arrivals_subtitle} onChange={(v) => updateContent("arrivals_subtitle", v)} />
            <Field label="arrivals_view_all" value={content.arrivals_view_all} onChange={(v) => updateContent("arrivals_view_all", v)} />
          </div>
        </Section>

        {/* Promo Banner */}
        <Section title="Promo Banner" icon={<span className="text-xs font-bold text-gray-400">03</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="promo_badge" value={content.promo_badge} onChange={(v) => updateContent("promo_badge", v)} />
            <Field label="promo_title" value={content.promo_title} onChange={(v) => updateContent("promo_title", v)} />
            <div className="sm:col-span-2">
              <Field label="promo_subtitle" value={content.promo_subtitle} onChange={(v) => updateContent("promo_subtitle", v)} />
            </div>
            <Field label="promo_btn" value={content.promo_btn} onChange={(v) => updateContent("promo_btn", v)} />
          </div>
        </Section>

        {/* Features */}
        <Section title="Feature Highlights" icon={<span className="text-xs font-bold text-gray-400">04</span>}>
          <div className="space-y-6">
            <Field label="features_title" value={content.features_title} onChange={(v) => updateContent("features_title", v)} />
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-xl border border-gray-100 p-4">
                <p className="mb-3 text-xs font-bold text-gray-400">Feature {n}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={`features_${n}_title`} value={content[`features_${n}_title`]} onChange={(v) => updateContent(`features_${n}_title`, v)} />
                  <Field label={`features_${n}_desc`} value={content[`features_${n}_desc`]} onChange={(v) => updateContent(`features_${n}_desc`, v)} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <Section title="Footer" icon={<span className="text-xs font-bold text-gray-400">05</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="footer_tagline" value={content.footer_tagline} onChange={(v) => updateContent("footer_tagline", v)} />
            </div>
            <Field label="footer_shop" value={content.footer_shop} onChange={(v) => updateContent("footer_shop", v)} />
            <Field label="footer_brand" value={content.footer_brand} onChange={(v) => updateContent("footer_brand", v)} />
            <Field label="footer_legal" value={content.footer_legal} onChange={(v) => updateContent("footer_legal", v)} />
            <Field label="footer_copyright" value={content.footer_copyright} onChange={(v) => updateContent("footer_copyright", v)} />
          </div>
        </Section>
      </div>

      {/* ═══ Admin Account ═══ */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-gray-400" />
          <div>
            <h2 className="text-lg font-bold">Admin Account</h2>
            <p className="mt-1 text-sm text-gray-400">Update email or change password</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-500">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-black" placeholder="admin@menspalace.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-500">Current Password (required)</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-black" placeholder="Enter current password" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-500">New Password (leave blank to keep current)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-black" placeholder="Enter new password" />
          </div>
          {profileError && <p className="text-sm text-red-500">{profileError}</p>}
          {profileSaved && <p className="text-sm text-green-600">Account updated successfully!</p>}
          <button onClick={handleProfileUpdate} disabled={profileSaving} className="rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50">
            {profileSaving ? "Updating..." : "Update Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
