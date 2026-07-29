"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Shield } from "lucide-react";

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

  const fetchSettings = useCallback(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.glow_color) setGlowColor(data.glow_color);
        if (data.glow_opacity) setGlowOpacity(parseInt(data.glow_opacity));
        if (data.glow_enabled !== undefined) setGlowEnabled(data.glow_enabled === "true");
      })
      .catch(() => {});
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.email) setEmail(user.email);
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
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [glowColor, glowOpacity, glowEnabled]);

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
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      setTimeout(() => setProfileSaved(false), 3000);
    } catch { setProfileError("Network error"); }
    setProfileSaving(false);
  }, [email, newPassword, currentPassword]);

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
