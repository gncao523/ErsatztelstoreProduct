import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.spares-accessories-shop-gmbh.de",
      },
      {
        protocol: "https",
        hostname: "shop.euras.com",
      },
    ],
  },
};

export default nextConfig;
