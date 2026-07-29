import { z } from "zod";

const safeString = (min?: number, max?: number) =>
  z.string().trim().min(min ?? 1).max(max ?? 500).refine(
    (v) => !/<script|javascript:|on\w+\s*=|data:text\/html/i.test(v),
    "Contains potentially dangerous content"
  );

export const LoginSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

export const SignupSchema = z.object({
  name: safeString(1, 100),
  email: z.string().trim().email("Invalid email format").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const CategorySchema = z.object({
  name: safeString(1, 100),
  image: z.string().url().nullable().optional(),
});

export const ProductCreateSchema = z.object({
  title: safeString(1, 200),
  description: safeString(1, 5000),
  category: safeString(1, 100),
  price: z.union([z.string(), z.number()]).transform((v) => {
    const n = typeof v === "string" ? parseInt(v, 10) : v;
    if (isNaN(n) || n < 0) throw new Error("Invalid price");
    return n;
  }),
  discountPrice: z.union([z.string(), z.number(), z.null()]).optional().transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "string" ? parseInt(v, 10) : v;
    if (isNaN(n) || n < 0) throw new Error("Invalid discount price");
    return n;
  }),
  images: z.array(z.string().url()).max(20, "Maximum 20 images").default([]),
  sizes: z.array(z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"])).default(["S", "M", "L", "XL", "XXL"]),
  inStock: z.boolean().default(true),
  badge: z.string().trim().max(50).nullable().optional(),
  cardScale: z.number().min(0.5).max(2).default(1),
  detailsScale: z.number().min(0.5).max(2).default(1),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const OrderCreateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
    size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]),
  })).min(1, "At least one item required").max(50, "Maximum 50 items"),
  shippingAddress: z.string().trim().min(5, "Shipping address is required").max(500),
});

export const OrderUpdateSchema = z.object({
  orderStatus: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
});

export const ContentUpdateSchema = z.object({
  key: z.string().trim().min(1).max(100).refine(
    (k) => /^[a-z0-9_]+$/.test(k),
    "Key must be alphanumeric with underscores only"
  ),
  value: z.string().max(50000),
});

export const SettingsUpdateSchema = z.object({
  key: z.string().trim().min(1).max(100).refine(
    (k) => /^[a-z0-9_]+$/.test(k),
    "Key must be alphanumeric with underscores only"
  ),
  value: z.string().max(50000),
});

export const ProfileUpdateSchema = z.object({
  email: z.string().trim().email().max(255).optional(),
  password: z.string().min(6).max(128).optional(),
  currentPassword: z.string().min(1).max(128).optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  const msg = result.error.issues.map((i) => i.message).join("; ");
  return { success: false, error: msg };
}
