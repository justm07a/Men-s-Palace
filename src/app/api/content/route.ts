import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function GET() {
  try {
    const contents = await prisma.siteContent.findMany();
    const result: Record<string, string> = {};
    contents.forEach((c) => { result[c.key] = c.value; });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { key, value } = await req.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error("Content update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
