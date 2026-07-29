"use client";

import { useEffect, useState, useCallback } from "react";
import { Save } from "lucide-react";

const contentKeys = [
  { key: "hero_title", label: "Hero Title", type: "text" },
  { key: "hero_subtitle", label: "Hero Subtitle", type: "text" },
  { key: "hero_description", label: "Hero Description", type: "text" },
  { key: "announcement", label: "Announcement Bar Text", type: "text" },
  { key: "sale_percentage", label: "Sale Percentage (%)", type: "number" },
  { key: "newsletter_title", label: "Newsletter Title", type: "text" },
];

export default function AdminContent() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then(setValues);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    for (const item of contentKeys) {
      if (values[item.key] !== undefined) {
        await fetch("/api/content", {
          method: "PUT",
          headers,
          body: JSON.stringify({ key: item.key, value: values[item.key] }),
        });
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [values]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Content</h1>
          <p className="mt-1 text-sm text-gray-500">Manage site-wide content and promotions</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {contentKeys.map((item) => (
          <div key={item.key} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <label className="mb-2 block text-sm font-bold text-gray-700">{item.label}</label>
            <p className="mb-3 text-xs text-gray-400">Key: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{item.key}</code></p>
            {item.type === "number" ? (
              <input
                type="number"
                value={values[item.key] || ""}
                onChange={(e) => setValues({ ...values, [item.key]: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
            ) : (
              <input
                type="text"
                value={values[item.key] || ""}
                onChange={(e) => setValues({ ...values, [item.key]: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
