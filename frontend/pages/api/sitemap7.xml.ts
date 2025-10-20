// Sitemap 7: Agents by letter (browse pages)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Main pages
    xml += `  <url>
    <loc>${baseUrl}/agents</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    // Browse by letter pages (A-Z, 0-9)
    const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    
    for (const letter of letters) {
      xml += `  <url>
    <loc>${baseUrl}/agents/browse/${letter}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap7:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

