import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
