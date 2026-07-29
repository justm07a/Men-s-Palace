import { formatPrice } from "./products";
export { formatPrice };

export interface DBProduct {
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
  sortOrder: number;
  cardScale: number | null;
  detailsScale: number | null;
  createdAt: string;
  updatedAt: string;
}

export function parseDBProduct(p: DBProduct) {
  let allImages: string[] = [];
  try {
    allImages = JSON.parse(p.images);
    if (!Array.isArray(allImages)) allImages = [];
  } catch {
    allImages = [];
  }

  const primaryImage = allImages.length > 0 ? allImages[0] : "";

  return {
    id: p.id,
    title: p.title,
    category: p.category,
    price: p.price,
    discountPrice: p.discountPrice,
    image: primaryImage,
    badge: p.badge,
    description: p.description,
    sizes: (() => { try { return JSON.parse(p.sizes); } catch { return ["S", "M", "L", "XL", "XXL"]; } })(),
    inStock: p.inStock,
    images: allImages,
    cardScale: p.cardScale ?? 1,
    detailsScale: p.detailsScale ?? 1,
    originalPrice: p.discountPrice || undefined,
  };
}

export const filterCategories = [
  "ALL",
  "PUFFER JACKET",
  "WINTER JACKET",
  "LIGHT SHELL",
  "VESTS",
  "HOODIES",
  "ACCESSORIES",
];
