/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'wzysiffisxewbieyuxrk.supabase.co' // <-- correct: only the hostname
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1350],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
};

module.exports = nextConfig; 