/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    appDir: true,
  },
  swcMinify: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
