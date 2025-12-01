import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

async function rawBody(req: Request): Promise<Buffer> {
  const arr = await req.arrayBuffer();
  return Buffer.from(arr);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !endpointSecret) return NextResponse.json({ error: "Missing config" }, { status: 400 });

  let event: Stripe.Event;

  try {
    const bodyBuf = await rawBody(req as unknown as Request);
    event = stripe.webhooks.constructEvent(bodyBuf, sig, endpointSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId as string | undefined;
    const subscriptionId = session.metadata?.subscriptionId as string | undefined;
    const plan = session.metadata?.plan as string | undefined;

    if (userId && subscriptionId && plan) {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          active: true,
          plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          currentPeriodEnd: new Date(
            (session.expires_at ?? Math.floor(Date.now() / 1000)) * 1000,
          ),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
