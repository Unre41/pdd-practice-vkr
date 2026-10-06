import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',

  // потому что репозиторий называется pdd-practice-vkr
  basePath: '/pdd-practice-vkr',
  assetPrefix: '/pdd-practice-vkr/',

  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
