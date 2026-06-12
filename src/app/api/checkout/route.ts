import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/env";
import { getStripe, isStripeEnabled } from "@/lib/stripe";
import { newOrderNumber } from "@/lib/orders";
import { sendOrderStatusEmails } from "@/lib/mail";

const checkoutSchema = z.object({
  locale: z.enum(["it", "en"]).default("it"),
  pickupInStore: z.boolean().default(false),
  customerName: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().trim().max(40).nullable().optional(),
  shippingLine1: z.string().trim().max(200).nullable().optional(),
  shippingCity: z.string().trim().max(100).nullable().optional(),
  shippingZip: z.string().trim().max(20).nullable().optional(),
  shippingCountry: z.string().trim().max(2).default("IT"),
  customerNote: z.string().trim().max(1000).nullable().optional(),
  items: z.array(z.object({ variantId: z.string().min(1) })).min(1).max(20),
});

export async function POST(request: NextRequest) {
  let payload: z.infer<typeof checkoutSchema>;
  try {
    payload = checkoutSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ code: "INVALID" }, { status: 400 });
  }

  if (!payload.pickupInStore && !payload.shippingLine1) {
    return NextResponse.json({ code: "INVALID" }, { status: 400 });
  }

  const variantIds = [...new Set(payload.items.map((i) => i.variantId))];

  try {
    // Ri-prezzatura server-side + riserva stock in transazione: i prezzi del
    // client non vengono mai usati, e con un pezzo per taglia il decremento
    // atomico evita doppie prenotazioni della stessa variante.
    const order = await db.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: {
            select: {
              name: true,
              status: true,
              priceCents: true,
              brand: { select: { name: true } },
              images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      });

      if (variants.length !== variantIds.length) throw new Error("OUT_OF_STOCK");

      for (const v of variants) {
        if (v.product.status !== "PUBLISHED" || v.quantity < 1) {
          throw new Error("OUT_OF_STOCK");
        }
      }

      for (const v of variants) {
        const res = await tx.productVariant.updateMany({
          where: { id: v.id, quantity: { gte: 1 } },
          data: { quantity: { decrement: 1 } },
        });
        if (res.count !== 1) throw new Error("OUT_OF_STOCK");
      }

      const totalCents = variants.reduce((sum, v) => sum + v.product.priceCents, 0);
      const stripeMode = isStripeEnabled();

      return tx.order.create({
        data: {
          orderNumber: newOrderNumber(),
          status: stripeMode ? "AWAITING_PAYMENT" : "PENDING_REVIEW",
          paymentMode: stripeMode ? "STRIPE" : "MANUAL",
          customerName: payload.customerName,
          email: payload.email,
          phone: payload.phone ?? null,
          shippingLine1: payload.shippingLine1 ?? null,
          shippingCity: payload.shippingCity ?? null,
          shippingZip: payload.shippingZip ?? null,
          shippingCountry: payload.shippingCountry,
          pickupInStore: payload.pickupInStore,
          locale: payload.locale,
          totalCents,
          customerNote: payload.customerNote ?? null,
          items: {
            create: variants.map((v) => ({
              variantId: v.id,
              productName: v.product.name,
              brandName: v.product.brand.name,
              size: v.size,
              priceCents: v.product.priceCents,
              imageUrl: v.product.images[0]?.url ?? null,
            })),
          },
        },
        include: { items: true },
      });
    });

    if (!isStripeEnabled()) {
      await sendOrderStatusEmails(order).catch(() => {});
      return NextResponse.json({ orderNumber: order.orderNumber });
    }

    // Modalità Stripe: Checkout Session con autorizzazione manuale (hold).
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_intent_data: { capture_method: "manual" },
      customer_email: payload.email,
      locale: payload.locale,
      line_items: order.items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: item.priceCents,
          product_data: {
            name: `${item.brandName} ${item.productName} (${item.size})`,
            images: item.imageUrl ? [`${env.NEXT_PUBLIC_SITE_URL}${item.imageUrl}`] : undefined,
          },
        },
      })),
      success_url: `${env.NEXT_PUBLIC_SITE_URL}/${payload.locale}/checkout/success?order=${order.orderNumber}`,
      cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/${payload.locale}/checkout/cancelled`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1h per pagare
    });

    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ orderNumber: order.orderNumber, stripeUrl: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "OUT_OF_STOCK") {
      return NextResponse.json({ code: "OUT_OF_STOCK" }, { status: 409 });
    }
    console.error("checkout error", err);
    return NextResponse.json({ code: "ERROR" }, { status: 500 });
  }
}
