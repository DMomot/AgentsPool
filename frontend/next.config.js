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
        source: '/sitemap10.xml',
        destination: '/api/sitemap10.xml',
      },
      {
        source: '/sitemap11.xml',
        destination: '/api/sitemap11.xml',
      },
      {
        source: '/sitemap12.xml',
        destination: '/api/sitemap12.xml',
      },
      {
        source: '/sitemap13.xml',
        destination: '/api/sitemap13.xml',
      },
      {
        source: '/sitemap14.xml',
        destination: '/api/sitemap14.xml',
      },
      {
        source: '/sitemap15.xml',
        destination: '/api/sitemap15.xml',
      },
      {
        source: '/sitemap16.xml',
        destination: '/api/sitemap16.xml',
      },
      {
        source: '/sitemap17.xml',
        destination: '/api/sitemap17.xml',
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
        source: '/sitemap.xml',
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

        source: '/sitemap-full.xml',
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
        source: '/sitemap1.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
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
        source: '/sitemap3.xml',
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
        source: '/sitemap4.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        source: '/sitemap5.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/xml; charset=utf-8',
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
