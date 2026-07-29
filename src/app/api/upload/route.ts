import { requireAdmin } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { validateFileUpload, validateFileMagicBytes } from "@/lib/upload-security";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const rl = rateLimit(req, "upload");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many upload requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const auth = requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400, headers: rl.headers });

    const validation = validateFileUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers: rl.headers });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const magicCheck = await validateFileMagicBytes(buffer, file.type);
    if (!magicCheck.valid) {
      return NextResponse.json({ error: magicCheck.error }, { status: 400, headers: rl.headers });
    }

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const ext = file.name.split(".").pop() || "jpg";
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "menspalace",
      public_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      format: ext,
      transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201, headers: rl.headers });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500, headers: rl.headers });
  }
}
