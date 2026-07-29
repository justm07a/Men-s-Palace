import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const rl = rateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const auth = requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { email, currentPassword, newPassword } = await req.json();

    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    if (currentPassword.length > 128) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const admin = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    if (email && typeof email === "string") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
      if (email !== admin.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
        }
      }
    }

    const updateData: Record<string, string> = {};
    if (email && typeof email === "string") updateData.email = email;
    if (newPassword && typeof newPassword === "string") {
      if (newPassword.length < 6 || newPassword.length > 128) {
        return NextResponse.json({ error: "Password must be 6-128 characters" }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: { id: updated.id, email: updated.email } }, { headers: rl.headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: rl.headers });
  }
}
