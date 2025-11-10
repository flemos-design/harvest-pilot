const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // API requests - NetworkFirst com fallback e background sync
    {
      urlPattern: /^https?:\/\/.*\/api\/v1\/(parcelas|operacoes|culturas|propriedades).*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-data-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
        plugins: [
          {
            handlerDidError: async () => {
              // Fallback para cache quando network falha
              return caches.match('/offline-fallback.json');
            },
          },
        ],
      },
    },
    // POST/PUT/DELETE requests - Background sync
    {
      urlPattern: /^https?:\/\/.*\/api\/v1\/(parcelas|operacoes|culturas).*/i,
      method: 'POST',
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'api-queue',
          options: {
            maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (in minutes)
          },
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/v1\/(parcelas|operacoes|culturas).*/i,
      method: 'PUT',
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'api-queue',
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/v1\/(parcelas|operacoes|culturas).*/i,
      method: 'DELETE',
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'api-queue',
          options: {
            maxRetentionTime: 24 * 60,
          },
        },
      },
    },
    // Map tiles - CacheFirst para tiles de mapas
    {
      urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // External images (Unsplash)
    {
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Static images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-image-cache',
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Fonts
    {
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: process.env.BUILD_MODE === 'export' ? 'export' : undefined,
  images: process.env.BUILD_MODE === 'export' ? { unoptimized: true } : {
    domains: ['localhost', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // PWA Configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack configuration for MapLibre
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'maplibre-gl': 'maplibre-gl/dist/maplibre-gl.js',
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);
