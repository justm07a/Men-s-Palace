import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteContent.findMany({
      where: {
        key: { in: [
          "glow_color", "glow_opacity", "glow_enabled", "home_categories", "home_categories_mobile",
          "hero_badge", "hero_title_line1", "hero_title_line2", "hero_title_highlight", "hero_title_suffix",
          "hero_subtitle", "hero_btn_primary", "hero_btn_secondary",
          "categories_title", "categories_show_more",
          "arrivals_title", "arrivals_subtitle", "arrivals_view_all",
          "promo_badge", "promo_title", "promo_subtitle", "promo_btn",
          "features_title",
          "features_1_title", "features_1_desc",
          "features_2_title", "features_2_desc",
          "features_3_title", "features_3_desc",
          "features_4_title", "features_4_desc",
          "footer_tagline", "footer_shop", "footer_brand", "footer_legal", "footer_copyright",
        ] },
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
