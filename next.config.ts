import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para GitHub Pages
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Base path para GitHub Pages (nome do repositório)
  basePath: process.env.NODE_ENV === 'production' ? '/oauth-project' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/oauth-project/' : '',

  images: {
    // Desabilitar otimização de imagens para export estático
    unoptimized: true,
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
    domains: ['localhost'],
  },

  // Configurações adicionais para funcionar com GitHub Pages
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
