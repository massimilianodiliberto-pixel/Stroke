import type { SessionOptions } from "iron-session";

// Separato da auth.ts perché viene importato anche dal middleware (edge runtime):
// qui non devono entrare dipendenze server-only come Prisma.
export interface SessionData {
  isAdmin?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "insecure-dev-secret-please-change-me!!",
  cookieName: "stroke_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};
