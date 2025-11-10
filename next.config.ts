// next.config.ts
import type { NextConfig } from "next";

const SERVICE_URL = process.env.NEXT_PUBLIC_SERVICE_URL;
if (!SERVICE_URL) {
  throw new Error("NEXT_PUBLIC_SERVICE_URL is not defined");
}

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  experimental: {
    serverActions: {
      // Prefer explicit domains. Wildcards may not behave as you think.
      allowedOrigins: ["localhost:3000", "finance-analyst-front-dep.vercel.app"],
    },
  },
  async rewrites() {
    return [
      {
        // Browser calls /api/... on your Vercel origin
        source: "/api/:path*",
        // Vercel proxies to Django; change the path part depending on your Django URLs:
        // If your Django endpoints are like http://20.57.160.54:8000/api/..., keep the /api here.
        // If your endpoints are at root (e.g. /auth/login), remove the /api below.
        destination: `${SERVICE_URL}/api/:path*`, // or `${SERVICE_URL}/api/:path*`
      },
    ];
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
