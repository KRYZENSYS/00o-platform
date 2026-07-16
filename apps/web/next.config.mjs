/** @type {import('next').NextConfig} */
const repoName = '00o-platform';
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const basePath = isGithubActions ? `/${repoName}` : '';

const nextConfig = {
  output: 'standalone',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },
  trailingSlash: true,
  experimental: {
    skipTrailingSlashRedirect: true,
  },
};

export default nextConfig;
