import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const isAdmin = payload.role === "admin";

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: payload.userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { items, shippingAddress } = await req.json();

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: "Items and shipping address are required" }, { status: 400 });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const unitPrice = product.discountPrice || product.price;
      totalPrice += unitPrice * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        unitPrice,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { isSubscribed: true, discountUsed: true } });

    let discountPercent = 0;
    if (user?.isSubscribed && !user.discountUsed) {
      const [discountSetting, newsletterEnabled] = await Promise.all([
        prisma.siteContent.findUnique({ where: { key: "newsletter_discount" } }),
        prisma.siteContent.findUnique({ where: { key: "newsletter_enabled" } }),
      ]);
      if (newsletterEnabled?.value !== "false") {
        discountPercent = parseInt(discountSetting?.value || "15");
      }
    }

    const originalTotal = totalPrice;
    const finalPrice = discountPercent > 0 ? Math.round(totalPrice * (1 - discountPercent / 100)) : totalPrice;

    const order = await prisma.order.create({
      data: {
        userId: payload.userId,
        totalPrice: finalPrice,
        originalTotal: discountPercent > 0 ? originalTotal : null,
        discountPercent: discountPercent > 0 ? discountPercent : null,
        shippingAddress,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    if (discountPercent > 0) {
      await prisma.user.update({ where: { id: payload.userId }, data: { discountUsed: true } });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
