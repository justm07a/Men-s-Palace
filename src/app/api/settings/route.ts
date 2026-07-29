import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateBody, SettingsUpdateSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const rl = rateLimit(request, "write");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const auth = requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const validation = validateBody(SettingsUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { key, value } = validation.data;
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);

    const setting = await prisma.siteContent.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue },
    });

    return NextResponse.json(setting, { headers: rl.headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: rl.headers });
  }
}
