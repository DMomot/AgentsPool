// Sitemap 10: Sitemap Index (master sitemap linking all others)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // All sitemap variants
    const sitemaps = [
      { url: '/api/sitemap5.xml', description: 'Main pages and categories' },
      { url: '/api/sitemap6.xml', description: 'All agents' },
      { url: '/api/sitemap7.xml', description: 'Browse by letter pages' },
      { url: '/api/sitemap8.xml', description: 'Featured and recent agents with images' },
      { url: '/api/sitemap9.xml', description: 'Fundraising companies' },
      { url: '/sitemap2.xml', description: 'Static sitemap' },
    ];

    for (const sitemap of sitemaps) {
      xml += `  <sitemap>
    <loc>${baseUrl}${sitemap.url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
`;
    }

    xml += `</sitemapindex>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap10:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

