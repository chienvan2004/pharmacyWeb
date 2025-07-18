import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // Thêm 'localhost' vào mảng domains
    remotePatterns: [ // Hoặc sử dụng remotePatterns cho cấu hình linh hoạt hơn
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**', 
      },
    ],
  },
};

export default nextConfig;
