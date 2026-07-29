import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, price, discountPrice, images, sizes, inStock, badge, cardScale, detailsScale } = body;

    if (!title || !description || !category || !price) {
      return NextResponse.json({ error: "Title, description, category, and price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        category,
        price: parseInt(price),
        discountPrice: discountPrice ? parseInt(discountPrice) : null,
        images: JSON.stringify(images || []),
        sizes: JSON.stringify(sizes || ["S", "M", "L", "XL", "XXL"]),
        inStock: inStock !== false,
        badge: badge || null,
        cardScale: typeof cardScale === "number" ? cardScale : 1,
        detailsScale: typeof detailsScale === "number" ? detailsScale : 1,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
