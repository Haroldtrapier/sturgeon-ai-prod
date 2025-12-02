import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/db";

const PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO_ID ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE_ID ?? "",
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan = (body.plan as string) ?? "pro";

  const priceId = PRICES[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  let subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
  });

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: { userId: user.id, plan: "free", active: false },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    metadata: {
      userId: user.id,
      subscriptionId: subscription.id,
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
