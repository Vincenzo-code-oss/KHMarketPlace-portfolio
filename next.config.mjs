/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // enable React 19 app dir patterns as needed
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
