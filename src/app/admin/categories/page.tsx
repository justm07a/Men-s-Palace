"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, FolderOpen, Save, Check, GripVertical, Upload } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  sortOrder: number;
  createdAt: string;
}

const CATEGORY_META: Record<string, string> = {
  "Jackets": "OUTERWEAR",
  "Hoodies": "HOODIES & ESSENTIALS",
  "Pants": "PANTS",
  "Shirts": "SHIRTS",
  "KOL 7AGA": "KOL 7AGA",
};

function getDisplayName(name: string) {
  return CATEGORY_META[name] || name;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [homeCategories, setHomeCategories] = useState<string[]>([]);
  const [homeCategoriesMobile, setHomeCategoriesMobile] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchCategories = useCallback(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchSettings = useCallback(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.home_categories) {
          try {
            const parsed = JSON.parse(data.home_categories);
            if (Array.isArray(parsed)) setHomeCategories(parsed);
          } catch {}
        }
        if (data.home_categories_mobile) {
          try {
            const parsed = JSON.parse(data.home_categories_mobile);
            if (Array.isArray(parsed)) setHomeCategoriesMobile(parsed);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, [fetchCategories, fetchSettings]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    let imageUrl: string | null = null;
    if (newImage) {
      const formData = new FormData();
      formData.append("file", newImage);
      const uploadRes = await fetch("/api/upload", { method: "POST", headers, body: formData });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
    }

    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ name: newName.trim(), image: imageUrl }),
    });
    setNewName("");
    setNewImage(null);
    setNewImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchCategories();
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setHomeCategories((prev) => {
      const deleted = categories.find((c) => c.id === id);
      if (deleted && prev.includes(deleted.name)) return prev.filter((n) => n !== deleted.name);
      return prev;
    });
    setHomeCategoriesMobile((prev) => {
      const deleted = categories.find((c) => c.id === id);
      if (deleted && prev.includes(deleted.name)) return prev.filter((n) => n !== deleted.name);
      return prev;
    });
    fetchCategories();
  };

  const toggleHomeCategory = useCallback((name: string) => {
    setHomeCategories((prev) => {
      if (prev.includes(name)) return prev.filter((f) => f !== name);
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  }, []);

  const handleSaveHomepage = useCallback(async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    await Promise.all([
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: "home_categories", value: JSON.stringify(homeCategories) }),
      }),
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: "home_categories_mobile", value: JSON.stringify(homeCategoriesMobile) }),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [homeCategories, homeCategoriesMobile]);

  return (
    <div>
      <div>
        <h1 className="text-3xl font-black">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage product categories for your store
        </p>
      </div>

      {/* Add Category */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-700">Add New Category</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500">Category Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Sneakers, Accessories"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>
          <div className="shrink-0">
            <label className="mb-1 block text-xs text-gray-500">Category Image</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="cat-image"
              />
              <label
                htmlFor="cat-image"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500 transition hover:border-black hover:text-black"
              >
                <Upload className="h-4 w-4" />
                {newImage ? "Change" : "Upload"}
              </label>
              {newImagePreview && (
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-200">
                  <Image src={newImagePreview} alt="Preview" fill className="object-cover" sizes="48px" />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* ═══ Homepage Display — Desktop & Tablet ═══ */}
      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Homepage Display — Desktop & Tablet</h2>
            <p className="mt-1 text-sm text-gray-400">
              Choose exactly 3 categories for desktop & tablet homepage
            </p>
          </div>
          <button onClick={handleSaveHomepage} disabled={saving} className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50">
            <Save className="h-4 w-4" />{saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
            Add categories above first, then select which ones appear on the homepage.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const isSelected = homeCategories.includes(cat.name);
              const isFull = homeCategories.length >= 3 && !isSelected;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setHomeCategories((prev) => {
                      if (prev.includes(cat.name)) return prev.filter((f) => f !== cat.name);
                      if (prev.length >= 3) return prev;
                      return [...prev, cat.name];
                    });
                  }}
                  disabled={isFull}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : isFull
                      ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat.image ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-white text-black" : "bg-gray-100 text-gray-400"}`}>
                      {isSelected ? <Check className="h-5 w-5" /> : <GripVertical className="h-5 w-5" />}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{getDisplayName(cat.name)}</p>
                    <p className={`text-[11px] truncate ${isSelected ? "text-white/50" : "text-gray-400"}`}>{cat.name}</p>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-black">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-[11px] text-gray-400">
          {homeCategories.length}/3 selected — {Math.max(0, 3 - homeCategories.length)} slot{3 - homeCategories.length !== 1 ? "s" : ""} remaining
        </p>
      </div>

      {/* ═══ Homepage Display — Mobile ═══ */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Homepage Display — Mobile</h2>
            <p className="mt-1 text-sm text-gray-400">
              Choose 1 to 3 categories for mobile homepage
            </p>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
            Add categories above first.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const isSelected = homeCategoriesMobile.includes(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setHomeCategoriesMobile((prev) => {
                      if (prev.includes(cat.name)) return prev.filter((f) => f !== cat.name);
                      if (prev.length >= 3) return prev;
                      return [...prev, cat.name];
                    });
                  }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat.image ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-white text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                      {isSelected ? <Check className="h-5 w-5" /> : <GripVertical className="h-5 w-5" />}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{getDisplayName(cat.name)}</p>
                    <p className={`text-[11px] truncate ${isSelected ? "text-white/50" : "text-gray-400"}`}>{cat.name}</p>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-[11px] text-gray-400">
          {homeCategoriesMobile.length} selected — {homeCategoriesMobile.length < 3 ? `add up to ${3 - homeCategoriesMobile.length} more` : "max reached"}
        </p>
      </div>

      {/* Categories List */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <FolderOpen className="h-12 w-12 text-gray-200" />
            <p className="mt-4 text-gray-400">No categories yet</p>
            <p className="text-xs text-gray-400">Add your first category above</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-bold text-gray-500">Image</th>
                <th className="px-6 py-3 font-bold text-gray-500">Name</th>
                <th className="px-6 py-3 font-bold text-gray-500 md:table-cell">Slug</th>
                <th className="px-6 py-3 font-bold text-gray-500 lg:table-cell">Created</th>
                <th className="px-6 py-3 font-bold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    {cat.image ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-100">
                        <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold">{cat.name}</td>
                  <td className="hidden px-6 py-4 text-gray-400 md:table-cell">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{cat.slug}</code>
                  </td>
                  <td className="hidden px-6 py-4 text-xs text-gray-400 lg:table-cell">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(cat.id)} className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
