import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { env } from "@/env";
import { getStripe, isStripeEnabled } from "@/lib/stripe";
import { transitionOrder } from "@/lib/orders";

export async function POST(request: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: "stripe disabled" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "no signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object;
    const order = await db.order.findUnique({ where: { stripeSessionId: session.id } });
    if (!order) return NextResponse.json({ received: true });

    if (event.type === "checkout.session.completed") {
      await db.order.update({
        where: { id: order.id },
        data: {
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
        },
      });
      if (order.status === "AWAITING_PAYMENT") {
        await transitionOrder(order.id, "PENDING_REVIEW");
      }
    } else if (order.status === "AWAITING_PAYMENT") {
      await transitionOrder(order.id, "CANCELLED");
    }
  }

  return NextResponse.json({ received: true });
}
