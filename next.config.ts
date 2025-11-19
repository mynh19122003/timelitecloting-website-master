import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export configuration for VPS deployment
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
  
  // Compress output
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  
  // Images configuration
  images: {
    unoptimized: true, // Disable image optimization for static export compatibility
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.timeliteclothing.com',
        pathname: '/admin/media/**',
      },
    ],
  },
  
  // Headers for caching and security
  // NOTE: Custom headers are not supported with 'output: export' (static export)
  // Headers must be configured at the web server level (nginx, Apache, etc.)
  // Example nginx configuration:
  //   add_header X-Frame-Options "SAMEORIGIN" always;
  //   add_header X-Content-Type-Options "nosniff" always;
  //   add_header Referrer-Policy "origin-when-cross-origin" always;
  //   location /images/ {
  //     add_header Cache-Control "public, max-age=31536000, immutable" always;
  //   }
  //   location /_next/static/ {
  //     add_header Cache-Control "public, max-age=31536000, immutable" always;
  //   }
};

export default nextConfig;
