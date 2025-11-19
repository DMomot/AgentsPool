/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.agentspool.ai',
          },
        ],
        destination: 'https://agentspool.ai/:path*',
        permanent: true, // 301 redirect
      },
      // Redirect from old domain primeagents.info to new domain agentspool.ai
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'primeagents.info',
          },
        ],
        destination: 'https://agentspool.ai/:path*',
        permanent: true, // 301 redirect
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.primeagents.info',
          },
        ],
        destination: 'https://agentspool.ai/:path*',
        permanent: true, // 301 redirect
      },
      // Fix incorrect routes
      {
        source: '/agents/numbers',
        destination: '/agents/browse/numbers',
        permanent: true,
      },
      {
        source: '/agents/null',
        destination: '/agents',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` : 'https://api.agentspool.ai/api/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/sitemap2.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/xml; charset=utf-8',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        source: '/sitemap-news1.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/xml; charset=utf-8',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  },
}

module.exports = nextConfig
