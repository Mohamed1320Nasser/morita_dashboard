/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.morita.vip',
      },
      {
        protocol: 'https',
        hostname: 'cdn.eduloom.net',
      },
    ],
    formats: ['image/webp'],
  }
}


module.exports = nextConfig