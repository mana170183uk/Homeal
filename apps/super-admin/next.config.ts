import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@homeal/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.azureedge.net" },
      { protocol: "https", hostname: "*.blob.core.windows.net" },
    ],
  },
};

export default nextConfig;
