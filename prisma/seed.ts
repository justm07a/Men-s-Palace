import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@menspalace.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@menspalace.com",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("Admin user:", admin.email, "password: admin123");

  // Seed products
  const productsData = [
    {
      title: "Arctic Shield Puffer Jacket",
      description: "Premium quilted puffer jacket with water-resistant shell and premium down insulation. Designed for the modern urban explorer.",
      category: "PUFFER JACKET",
      price: 4999,
      discountPrice: 6499,
      badge: "NEW",
      sortOrder: 1,
    },
    {
      title: "Urban Storm Winter Coat",
      description: "Full-length premium winter coat with fur-lined hood and thermal insulation. Unmatched warmth meets street-ready style.",
      category: "WINTER JACKET",
      price: 6999,
      badge: "NEW",
      sortOrder: 2,
    },
    {
      title: "Phantom Light Shell",
      description: "Ultra-lightweight windbreaker with reflective detailing. Perfect for transitional weather and layering.",
      category: "LIGHT SHELL",
      price: 2999,
      discountPrice: 3999,
      sortOrder: 3,
    },
    {
      title: "Titanium Tactical Vest",
      description: "Multi-pocket tactical vest with adjustable fit. Military-inspired design meets premium craftsmanship.",
      category: "VESTS",
      price: 2499,
      badge: "NEW",
      sortOrder: 4,
    },
    {
      title: "Noir Edition Puffer",
      description: "All-black premium puffer with matte finish and embossed logo. Statement piece for any winter wardrobe.",
      category: "PUFFER JACKET",
      price: 5499,
      sortOrder: 5,
    },
    {
      title: "Frost Walker Down Vest",
      description: "Premium goose down vest with corduroy trim. Layering essential for the modern gentleman.",
      category: "VESTS",
      price: 3499,
      discountPrice: 4299,
      badge: "NEW",
      sortOrder: 6,
    },
    {
      title: "Summit Shell Jacket",
      description: "Technical shell jacket with sealed seams and breathable membrane. Built for performance, styled for the city.",
      category: "LIGHT SHELL",
      price: 3299,
      sortOrder: 7,
    },
    {
      title: "Glacier Peak Parka",
      description: "Expedition-grade parka with removable fur hood and 800-fill down insulation. Conquer any climate in luxury.",
      category: "WINTER JACKET",
      price: 7999,
      discountPrice: 9999,
      badge: "NEW",
      sortOrder: 8,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.title.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: p.title.toLowerCase().replace(/\s+/g, "-"),
        ...p,
        images: JSON.stringify(["/logo.jpg"]),
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
        inStock: true,
      },
    });
  }

  // Seed site content
  const contents = [
    { key: "hero_title", value: "ELEVATE YOUR STYLE IN EVERY REALITY" },
    { key: "hero_subtitle", value: "Premium Collection 2026" },
    { key: "hero_description", value: "Discover premium outerwear crafted for the modern gentleman. Where luxury meets urban edge." },
    { key: "announcement", value: "FREE SHIPPING ON ORDERS OVER EGP 2,000" },
    { key: "sale_percentage", value: "30" },
    { key: "newsletter_title", value: "GET 15% OFF YOUR FIRST ORDER" },
  ];

  for (const c of contents) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    });
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
