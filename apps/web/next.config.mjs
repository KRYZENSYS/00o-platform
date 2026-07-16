/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  // Disable all checks
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Skip all checks during build
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  poweredByHeader: false,
  compiler: {
    removeConsole: false,
  },
};

export default nextConfig;
