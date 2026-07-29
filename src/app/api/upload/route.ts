import { verifyToken } from "@/lib/jwt";
import { cloudinary } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const ext = file.name.split(".").pop() || "jpg";
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "menspalace",
      public_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      format: ext,
      transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
