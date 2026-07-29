import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
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

  const productsData = [
    { title: "Arctic Shield Puffer Jacket", description: "Premium quilted puffer jacket with water-resistant shell and premium down insulation.", category: "PUFFER JACKET", price: 4999, discountPrice: 6499, badge: "NEW", sortOrder: 1 },
    { title: "Urban Storm Winter Coat", description: "Full-length premium winter coat with fur-lined hood and thermal insulation.", category: "WINTER JACKET", price: 6999, badge: "NEW", sortOrder: 2 },
    { title: "Phantom Light Shell", description: "Ultra-lightweight windbreaker with reflective detailing.", category: "LIGHT SHELL", price: 2999, discountPrice: 3999, sortOrder: 3 },
    { title: "Titanium Tactical Vest", description: "Multi-pocket tactical vest with adjustable fit.", category: "VESTS", price: 2499, badge: "NEW", sortOrder: 4 },
    { title: "Noir Edition Puffer", description: "All-black premium puffer with matte finish and embossed logo.", category: "PUFFER JACKET", price: 5499, sortOrder: 5 },
    { title: "Frost Walker Down Vest", description: "Premium goose down vest with corduroy trim.", category: "VESTS", price: 3499, discountPrice: 4299, badge: "NEW", sortOrder: 6 },
    { title: "Summit Shell Jacket", description: "Technical shell jacket with sealed seams and breathable membrane.", category: "LIGHT SHELL", price: 3299, sortOrder: 7 },
    { title: "Glacier Peak Parka", description: "Expedition-grade parka with removable fur hood and 800-fill down insulation.", category: "WINTER JACKET", price: 7999, discountPrice: 9999, badge: "NEW", sortOrder: 8 },
  ];

  for (const p of productsData) {
    const existing = await prisma.product.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...p,
          images: JSON.stringify(["/logo.jpg"]),
          sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
          inStock: true,
        },
      });
    }
  }

  const settings = [
    { key: "glow_color", value: "#ff9d00" },
    { key: "glow_enabled", value: "true" },
    { key: "glow_opacity", value: "12" },
    { key: "home_categories", value: '["Jackets","Hoodies","Pants"]' },
    { key: "home_categories_mobile", value: '["Shirts"]' },
    { key: "newsletter_enabled", value: "true" },
    { key: "newsletter_discount", value: "10" },
  ];

  for (const s of settings) {
    const existing = await prisma.siteContent.findUnique({ where: { key: s.key } });
    if (!existing) {
      await prisma.siteContent.create({ data: s });
    }
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
