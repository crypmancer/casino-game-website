/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/socket', destination: 'http://localhost:2083' },
    ];
  },
};

module.exports = nextConfig;
