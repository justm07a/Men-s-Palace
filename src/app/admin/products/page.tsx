"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Upload,
  Star,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number | null;
  images: string;
  sizes: string;
  inStock: boolean;
  badge: string | null;
}

interface ImageEntry {
  url: string;
  isPrimary: boolean;
  file?: File;
}

const defaultForm = {
  title: "",
  description: "",
  category: "PUFFER JACKET",
  price: "",
  discountPrice: "",
  sizes: ["S", "M", "L", "XL", "XXL"],
  inStock: true,
  badge: "",
  cardScale: 1,
  detailsScale: 1,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    "PUFFER JACKET",
    "WINTER JACKET",
    "LIGHT SHELL",
    "VESTS",
    "HOODIES",
    "ACCESSORIES",
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const fetchCategories = useCallback(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map((c: { name: string }) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const openNew = () => {
    setForm(defaultForm);
    setImages([]);
    setEditing({ id: "" } as Product);
  };

  const openEdit = (p: Product) => {
    let sizes = ["S", "M", "L", "XL", "XXL"];
    try {
      sizes = JSON.parse(p.sizes);
    } catch {}
    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(p.images);
    } catch {
      parsedImages = [];
    }
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      sizes,
      inStock: p.inStock,
      badge: p.badge || "",
      cardScale: p.cardScale ?? 1,
      detailsScale: p.detailsScale ?? 1,
    });
    setImages(
      parsedImages.map((url, i) => ({
        url,
        isPrimary: i === 0,
      }))
    );
    setEditing(p);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) return data.url;
    } catch (e) {
      console.error("Upload failed:", e);
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImages: ImageEntry[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) {
        newImages.push({ url, isPrimary: false });
      }
    }
    setImages((prev) => {
      const combined = [...prev, ...newImages];
      if (combined.length > 0 && !combined.some((i) => i.isPrimary)) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((i) => i.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.price) {
      alert("Please fill in title, description, and price.");
      return;
    }
    if (images.length === 0) {
      alert("Please upload at least one product image.");
      return;
    }
    setSaving(true);
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const primaryIndex = images.findIndex((i) => i.isPrimary);
    const orderedImages = [
      images[primaryIndex >= 0 ? primaryIndex : 0],
      ...images.filter((_, i) => i !== (primaryIndex >= 0 ? primaryIndex : 0)),
    ];
    const imageUrls = orderedImages.map((i) => i.url);

    const body = JSON.stringify({
      ...form,
      price: form.price,
      discountPrice: form.discountPrice || null,
      images: imageUrls,
      cardScale: form.cardScale,
      detailsScale: form.detailsScale,
    });

    if (editing?.id) {
      await fetch(`/api/products/${editing.id}`, {
        method: "PUT",
        headers,
        body,
      });
    } else {
      await fetch("/api/products", { method: "POST", headers, body });
    }

    setEditing(null);
    fetchProducts();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/80"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-bold text-gray-500">Product</th>
              <th className="px-6 py-3 font-bold text-gray-500 md:table-cell">
                Category
              </th>
              <th className="px-6 py-3 font-bold text-gray-500 lg:table-cell">
                Price
              </th>
              <th className="px-6 py-3 font-bold text-gray-500 lg:table-cell">
                Stock
              </th>
              <th className="px-6 py-3 font-bold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.badge && (
                      <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                        {p.badge}
                      </span>
                    )}
                    <span className="font-bold">{p.title}</span>
                  </div>
                </td>
                <td className="hidden px-6 py-4 text-gray-500 md:table-cell">
                  {p.category}
                </td>
                <td className="hidden px-6 py-4 lg:table-cell">
                  <span className="font-bold">
                    EGP {p.price.toLocaleString()}
                  </span>
                  {p.discountPrice && (
                    <span className="ml-2 text-xs text-gray-400 line-through">
                      EGP {p.discountPrice.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="hidden px-6 py-4 lg:table-cell">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      p.inStock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-lg bg-gray-100 p-2 transition hover:bg-gray-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========== ADD / EDIT MODAL ========== */}
      {editing && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-black">
                  {editing.id ? "Edit Product" : "New Product"}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-full bg-gray-100 p-2 transition hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {/* Image Upload */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-500">
                    Product Images
                    {images.length === 0 && (
                      <span className="ml-2 text-red-500">(required)</span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all"
                        style={{
                          borderColor: img.isPrimary ? "#000" : "transparent",
                        }}
                        onClick={() => setPrimary(i)}
                      >
                        <img
                          src={img.url}
                          alt={`Product ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {img.isPrimary && (
                          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[9px] font-bold text-white">
                            <Star className="h-2.5 w-2.5 fill-white" /> Cover
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(i);
                          }}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 transition hover:border-black hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                      ) : (
                        <Upload className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-[10px] font-bold text-gray-400">
                        {uploading ? "Uploading..." : "Add"}
                      </span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <p className="mt-2 text-[10px] text-gray-400">
                    Click an image to set as cover. Upload at least one image.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-500">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-500">
                      Badge
                    </label>
                    <input
                      value={form.badge}
                      onChange={(e) =>
                        setForm({ ...form, badge: e.target.value })
                      }
                      placeholder="e.g. NEW, SALE"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-500">
                      Price (EGP)
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-500">
                      Discount Price (EGP)
                    </label>
                    <input
                      type="number"
                      value={form.discountPrice}
                      onChange={(e) =>
                        setForm({ ...form, discountPrice: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-500">
                    Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["S", "M", "L", "XL", "XXL"].map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition ${
                          form.sizes.includes(s)
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold">In Stock</p>
                    <p className="text-[11px] text-gray-400">
                      Toggle product availability
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, inStock: !form.inStock })
                    }
                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      form.inStock ? "bg-black" : "bg-gray-200"
                    }`}
                    role="switch"
                    aria-checked={form.inStock}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        form.inStock
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Image Scale Controls */}
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="mb-3 text-xs font-bold text-gray-500">IMAGE SCALE</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-400">Card View</label>
                        <span className="text-[11px] font-bold text-gray-400">{form.cardScale}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={2}
                        step={0.05}
                        value={form.cardScale}
                        onChange={(e) => setForm({ ...form, cardScale: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-black"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-400">Details View</label>
                        <span className="text-[11px] font-bold text-gray-400">{form.detailsScale}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={2}
                        step={0.05}
                        value={form.detailsScale}
                        onChange={(e) => setForm({ ...form, detailsScale: parseFloat(e.target.value) })}
                        className="w-full cursor-pointer accent-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />{" "}
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
