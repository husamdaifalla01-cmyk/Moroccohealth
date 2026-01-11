/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dawa/shared', '@dawa/supabase'],
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
