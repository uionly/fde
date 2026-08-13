import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/labs/games", destination: "/games", permanent: true },
      { source: "/labs/games/:gameSlug", destination: "/games/:gameSlug", permanent: true },
    ];
  },
};

export default nextConfig;
