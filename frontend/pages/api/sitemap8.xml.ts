// Sitemap 8: Featured & Recently Added Agents (with images)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentspool.ai';
    
    // Fetch featured agents
    const featuredRes = await fetch(`${apiUrl}/api/v1/agents/featured?limit=50`);
    const featuredData = await featuredRes.json();
    const featured = featuredData.agents || [];

    // Fetch recent agents
    const recentRes = await fetch(`${apiUrl}/api/v1/agents?limit=100`);
    const recentData = await recentRes.json();
    const recent = recentData.agents || [];

    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Featured agents with images
    for (const agent of featured) {
      if (!agent.slug) continue;
      
      xml += `  <url>
    <loc>${baseUrl}/agents/${agent.slug}</loc>
    <lastmod>${agent.updated_at || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
`;
      
      const imageUrl = agent.img_url || `https://pub-cd507b944a95482a8deaa9b622cb1a6d.r2.dev/thumbnails/${agent.slug}_thumbnail.webp`;
      xml += `    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${agent.name}</image:title>
      <image:caption>${agent.short_description || agent.name}</image:caption>
    </image:image>
`;
      
      xml += `  </url>
`;
    }

    // Recent agents
    for (const agent of recent) {
      if (!agent.slug) continue;
      
      xml += `  <url>
    <loc>${baseUrl}/agents/${agent.slug}</loc>
    <lastmod>${agent.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap8:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

