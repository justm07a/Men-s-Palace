import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateBody, ContentUpdateSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const contents = await prisma.siteContent.findMany();
    const result: Record<string, string> = {};
    contents.forEach((c) => { result[c.key] = c.value; });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const rl = rateLimit(req, "write");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const auth = requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const validation = validateBody(ContentUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { key, value } = validation.data;

    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(content, { headers: rl.headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: rl.headers });
  }
}
