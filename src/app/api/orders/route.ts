import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { validateBody, OrderCreateSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const isAdmin = auth.role === "admin";

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: auth.userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const rl = rateLimit(req, "write");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
  }

  try {
    const auth = authenticate(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const validation = validateBody(OrderCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { items, shippingAddress } = validation.data;

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      if (!product.inStock) continue;

      const unitPrice = product.discountPrice || product.price;
      totalPrice += unitPrice * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        unitPrice,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "No valid in-stock items in order" }, { status: 400, headers: rl.headers });
    }

    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        totalPrice,
        shippingAddress,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(order, { status: 201, headers: rl.headers });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: rl.headers });
  }
}
