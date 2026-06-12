import Stripe from "stripe";
import { env } from "@/env";

export function isStripeEnabled() {
  return env.STRIPE_ENABLED;
}

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_ENABLED) {
    throw new Error("Stripe non è abilitato (STRIPE_ENABLED=false)");
  }
  if (!client) client = new Stripe(env.STRIPE_SECRET_KEY);
  return client;
}
