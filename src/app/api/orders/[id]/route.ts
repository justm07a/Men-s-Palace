import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validateBody, OrderUpdateSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = rateLimit(req, "write");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const auth = requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await req.json();
    const validation = validateBody(OrderUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (validation.data.orderStatus !== undefined) data.orderStatus = validation.data.orderStatus;
    if (validation.data.paymentStatus !== undefined) data.paymentStatus = validation.data.paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(order, { headers: rl.headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: rl.headers });
  }
}
