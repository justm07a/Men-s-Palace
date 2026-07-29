import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Newsletter is no longer available" }, { status: 404 });
}

export async function GET() {
  return NextResponse.json({ subscribed: false });
}
