import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during build for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static generation
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Proxy API requests to gateway (with optional direct admin backend bypass)
  async rewrites() {
    const useDirectAdmin = process.env.NEXT_PUBLIC_ADMIN_DIRECT === 'true'
    const adminDestination = useDirectAdmin
      ? 'http://localhost:3002/admin/:path*'
      : (process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/admin/:path*`
          : 'http://localhost:3001/admin/:path*')
    return [
      {
        source: '/api/admin/:path*',
        destination: adminDestination,
      },
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:3001/:path*',
      },
      {
        source: '/admin/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/admin/:path*`
          : 'http://localhost:3001/admin/:path*',
      },
    ];
  },
  images: {
    unoptimized: true, // Disable image optimization for static export compatibility
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/admin/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/admin/media/**',
      },
      // Allow images from any domain for production (VPS)
      // You can restrict this to specific domains for better security
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/admin/media/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/admin/media/**',
      },
    ],
  },
};

export default nextConfig;
