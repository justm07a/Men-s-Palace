import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.isSubscribed) {
        return NextResponse.json({ message: "Already subscribed", alreadySubscribed: true });
      }
      await prisma.user.update({ where: { email }, data: { isSubscribed: true } });
      return NextResponse.json({ message: "Subscribed successfully" });
    }

    return NextResponse.json({ message: "Email not found. Please create an account first." }, { status: 404 });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ subscribed: false });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ subscribed: false });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isSubscribed: true, discountUsed: true },
    });

    return NextResponse.json({ subscribed: user?.isSubscribed || false, discountUsed: user?.discountUsed || false });
  } catch {
    return NextResponse.json({ subscribed: false });
  }
}
