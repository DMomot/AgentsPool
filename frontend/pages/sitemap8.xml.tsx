// Sitemap 8: Featured & Recently Added Agents (with images)
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
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
      
      // Format date properly
      let lastmod = now;
      if (agent.updated_at) {
        try {
          const date = new Date(agent.updated_at);
          lastmod = date.toISOString();
        } catch (e) {
          lastmod = now;
        }
      }
      
      xml += `  <url>
    <loc>${baseUrl}/agents/${agent.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
`;
      
      const escapedDescription = (agent.short_description || agent.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const imageUrl = agent.img_url || `https://pub-cd507b944a95482a8deaa9b622cb1a6d.r2.dev/thumbnails/${agent.slug}_thumbnail.webp`;
      xml += `    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${agent.name}</image:title>
      <image:caption>${escapedDescription}</image:caption>
    </image:image>
`;
      
      xml += `  </url>
`;
    }

    // Recent agents
    for (const agent of recent) {
      if (!agent.slug) continue;
      
      // Format date properly
      let lastmod = now;
      if (agent.updated_at) {
        try {
          const date = new Date(agent.updated_at);
          lastmod = date.toISOString();
        } catch (e) {
          lastmod = now;
        }
      }
      
      xml += `  <url>
    <loc>${baseUrl}/agents/${agent.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(xml);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap8:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default function Sitemap8() {
  return null;
}

