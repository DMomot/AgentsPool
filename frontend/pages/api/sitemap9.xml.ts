// Sitemap 9: Fundraising companies
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentspool.ai';
    
    // Fetch fundraising companies
    const fundraisingRes = await fetch(`${apiUrl}/api/v1/fundraising?limit=1000`);
    const fundraisingData = await fundraisingRes.json();
    const companies = fundraisingData.companies || [];

    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Fundraising main page
    xml += `  <url>
    <loc>${baseUrl}/fundraising</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // Individual company pages (if they exist)
    for (const company of companies) {
      xml += `  <url>
    <loc>${baseUrl}/fundraising/${company.id}</loc>
    <lastmod>${company.created_at || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap9:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

