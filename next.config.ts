import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil"
    });
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
};

export default nextConfig;