import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateBody, ProductCreateSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(req, "write");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const auth = requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const validation = validateBody(ProductCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const d = validation.data;

    const product = await prisma.product.create({
      data: {
        title: d.title,
        description: d.description,
        category: d.category,
        price: d.price,
        discountPrice: d.discountPrice ?? null,
        images: JSON.stringify(d.images),
        sizes: JSON.stringify(d.sizes),
        inStock: d.inStock,
        badge: d.badge ?? null,
        cardScale: d.cardScale,
        detailsScale: d.detailsScale,
      },
    });

    return NextResponse.json(product, { status: 201, headers: rl.headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: rl.headers });
  }
}
