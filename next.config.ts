// next.config.ts
import type { NextConfig } from "next";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE ?? "https://lilyanna-synclastic-homeostatically.ngrok-free.dev";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_BASE}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
