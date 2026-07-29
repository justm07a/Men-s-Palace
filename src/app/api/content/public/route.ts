import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteContent.findMany({
      where: {
        key: { in: [
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
    settings.forEach((s) => { result[s.key] = s.value; });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
