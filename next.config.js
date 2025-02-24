/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['a.ppy.sh', 'i.ppy.sh', 'assets.ppy.sh', 'osu.ppy.sh'],
  },
};

module.exports = nextConfig;
