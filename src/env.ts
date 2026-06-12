import { z } from "zod";

const boolFromString = z
  .enum(["true", "false"])
  .default("false")
  .transform((v) => v === "true");

const schema = z
  .object({
    DATABASE_URL: z.string().min(1),
    SESSION_SECRET: z.string().min(32, "SESSION_SECRET deve avere almeno 32 caratteri"),
    ADMIN_USER: z.string().min(1),
    ADMIN_PASSWORD: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    STRIPE_ENABLED: boolFromString,
    STRIPE_SECRET_KEY: z.string().optional().default(""),
    STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
    EMAIL_ENABLED: boolFromString,
    RESEND_API_KEY: z.string().optional().default(""),
    EMAIL_FROM: z.string().optional().default("Stroke Shop <onboarding@resend.dev>"),
    SHOP_NOTIFICATION_EMAIL: z.string().optional().default(""),
  })
  .refine((e) => !e.STRIPE_ENABLED || (e.STRIPE_SECRET_KEY && e.STRIPE_WEBHOOK_SECRET), {
    message: "Con STRIPE_ENABLED=true servono STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET",
  })
  .refine((e) => !e.EMAIL_ENABLED || e.RESEND_API_KEY, {
    message: "Con EMAIL_ENABLED=true serve RESEND_API_KEY",
  });

export const env = schema.parse(process.env);
