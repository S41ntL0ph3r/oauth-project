import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
    // Configurações para imagens locais
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['localhost'],
  },
};

export default nextConfig;
