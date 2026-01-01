import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '1m5113h8dg.ufs.sh',
      },
    ],
  },
};

export default nextConfig;
