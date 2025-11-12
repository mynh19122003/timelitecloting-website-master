import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for VPS deployment
  output: 'export',
  // Disable ESLint during build for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Build ID for cache busting
  generateBuildId: async () => {
    return 'build-' + Date.now();
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
