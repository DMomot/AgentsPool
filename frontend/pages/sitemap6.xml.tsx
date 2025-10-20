// Sitemap 6: Agents only (paginated, first 1000)
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
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
      
      // Format date properly (remove microseconds, ensure ISO format)
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
    <priority>0.6</priority>
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
    console.error('Error generating sitemap6:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default function Sitemap6() {
  return null;
}

