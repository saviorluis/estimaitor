/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ttf|woff|woff2)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]'
      }
    });
    // Add WASM support
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data: blob:",
              "img-src 'self' data: blob:",
              "connect-src 'self' https: data: blob: 'unsafe-eval'",
              "worker-src 'self' blob:",
              "frame-src 'self'",
              "media-src 'self'",
              "manifest-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "wasm-unsafe-eval 'self' data: blob:",
            ].join('; ')
          }
        ]
      }
    ];
  },
  // Ensure static files are served correctly
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: '/static/fonts/:path*'
      }
    ];
  }
};

module.exports = withPWA(nextConfig); 