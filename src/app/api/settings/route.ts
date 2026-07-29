import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await prisma.siteContent.findMany({
      where: {
        key: { in: ["glow_color", "glow_opacity", "glow_enabled", "home_categories", "home_categories_mobile"] },
      },
    });
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const key = body.key as string;
    const value = body.value as string;

    if (!key || value === undefined || value === null) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const stringValue = typeof value === "string" ? value : JSON.stringify(value);

    const setting = await prisma.siteContent.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue },
    });

    return NextResponse.json(setting);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Settings update error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
