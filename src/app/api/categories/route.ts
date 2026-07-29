import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateBody, CategorySchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
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
    const validation = validateBody(CategorySchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, image } = validation.data;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const category = await prisma.category.create({
      data: { name, slug, image: image || null },
    });

    return NextResponse.json(category, { status: 201, headers: rl.headers });
  } catch (error: unknown) {
    const msg = error instanceof Error && error.message?.includes("Unique constraint")
      ? "Category already exists"
      : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 400, headers: rl.headers });
  }
}
