/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Add headers configuration with more permissive CSP
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'self' data: blob: 'unsafe-inline' 'unsafe-eval';"
          }
        ],
      }
    ];
  },
};

module.exports = nextConfig; 