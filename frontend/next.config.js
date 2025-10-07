/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
  async redirects() {
    return [
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
    ]
  },
  async rewrites() {
    return [
      {
        source: '/sitemap-generated.xml',
        destination: '/api/sitemap.xml',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
      {
        source: '/sitemap2.xml',
        destination: '/api/sitemap2.xml',
      },
      {
        source: '/sitemap-txt.xml',
        destination: '/api/sitemap-txt.xml',
      },
      {
        source: '/sitemap-json.xml',
        destination: '/api/sitemap-json.xml',
      },
      {
        source: '/sitemap-xml.xml',
        destination: '/api/sitemap-xml.xml',
      },
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` : 'https://api.agentspool.ai/api/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/sitemap-generated.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
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
