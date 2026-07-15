/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS === 'true' ? '/00o-platform' : '',
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS === 'true' ? '/00o-platform/' : '',
};

export default nextConfig;
