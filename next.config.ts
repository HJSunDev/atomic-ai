import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Clerk 主域名及子域名
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.clerk.com',
        pathname: '/**',
      },
      // Clerk 开发域名及子域名
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.clerk.dev',
        pathname: '/**',
      },
      // Clerk 账户域名 - 涵盖自定义域名
      {
        protocol: 'https',
        hostname: '**.accounts.dev',
        pathname: '/**',
      },
      // 常见第三方头像服务，用于OAuth登录
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
