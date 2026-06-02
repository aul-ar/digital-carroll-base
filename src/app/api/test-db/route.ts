import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const order = await prisma.order.create({
    data: {
      orderId: `TEST-${Date.now()}`,
      status: "WAITING_PAYMENT",
      customerName: "Aulia",
      customerEmail: "test@test.com",
      customerWhatsapp: "08123456789",
      packageName: "Testing Package",
      packageDescription: "Testing Database",
      quantity: 1,
      price: 10000,
      subtotal: 10000,
      total: 10000,
    },
  });

  return NextResponse.json(order);
}