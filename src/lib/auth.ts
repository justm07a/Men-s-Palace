import { verifyToken, type JWTPayload } from "./jwt";
import { NextResponse } from "next/server";

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export function authenticate(req: Request): JWTPayload | NextResponse {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
  return payload;
}

export function requireAdmin(req: Request): JWTPayload | NextResponse {
  const result = authenticate(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return result;
}
