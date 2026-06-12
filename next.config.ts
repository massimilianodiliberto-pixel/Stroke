import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "exceljs", "sharp"],
  // Include il database demo nel bundle serverless (demo su Vercel).
  outputFileTracingIncludes: {
    "/**": ["./prisma/demo.db"],
  },
};

export default withNextIntl(nextConfig);
