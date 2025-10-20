// Sitemap 6: Agents only (paginated, first 1000)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentspool.ai';
    
    // Fetch first 1000 agents
    const agentsRes = await fetch(`${apiUrl}/api/v1/agents?limit=1000`);
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];

    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Agents pages
    for (const agent of agents) {
      if (!agent.slug) continue;
      
      xml += `  <url>
    <loc>${baseUrl}/agents/${agent.slug}</loc>
    <lastmod>${agent.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap6:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

