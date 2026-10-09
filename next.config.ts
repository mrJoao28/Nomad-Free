import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O Dockerfile de produção define NEXT_OUTPUT=standalone; localmente usamos `next start` normal.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
