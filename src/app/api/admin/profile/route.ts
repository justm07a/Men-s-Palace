import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function PUT(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { email, currentPassword, newPassword } = await req.json();
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    const admin = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    if (email && email !== admin.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
      }
    }

    const updateData: Record<string, string> = {};
    if (email) updateData.email = email;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: { id: updated.id, email: updated.email } });
  } catch (error) {
    console.error("Admin profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
