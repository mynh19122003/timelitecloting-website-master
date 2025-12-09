/**
 * Enable static export for deployment to plain hosting/CDN.
 * - output: 'export' generates /out
 * - images.unoptimized required for next export
 */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow export even if type checks would fail; useful for static export packaging
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

