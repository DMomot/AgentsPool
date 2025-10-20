// Master Sitemap: All content in one file
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentspool.ai';
    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    // Fetch all data in parallel
    const [categoriesRes, agentsRes, featuredRes, fundraisingRes] = await Promise.all([
      fetch(`${apiUrl}/api/v1/categories`),
      fetch(`${apiUrl}/api/v1/agents?limit=1000`),
      fetch(`${apiUrl}/api/v1/agents/featured?limit=50`),
      fetch(`${apiUrl}/api/v1/fundraising?limit=500`),
    ]);

    const categories = await categoriesRes.json();
    const agentsData = await agentsRes.json();
    const agents = agentsData.agents || [];
    const featuredData = await featuredRes.json();
    const featured = featuredData.agents || [];
    const fundraisingData = await fundraisingRes.json();
    const companies = fundraisingData.companies || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

    // ===== MAIN PAGES (Highest Priority) =====
    const mainPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/catalog', priority: '0.9', changefreq: 'daily' },
      { url: '/categories', priority: '0.9', changefreq: 'daily' },
      { url: '/agents', priority: '0.9', changefreq: 'daily' },
      { url: '/fundraising', priority: '0.8', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/add-agent', priority: '0.6', changefreq: 'monthly' },
    ];

    for (const page of mainPages) {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // ===== CATEGORIES =====
    for (const category of categories) {
      xml += `  <url>
    <loc>${baseUrl}/${category.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // ===== BROWSE BY LETTER PAGES =====
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

    // ===== FEATURED AGENTS (with images) =====
    const featuredSlugs = new Set();
    for (const agent of featured) {
      if (!agent.slug) continue;
      featuredSlugs.add(agent.slug);
      
      let lastmod = now;
      if (agent.updated_at) {
        try {
          lastmod = new Date(agent.updated_at).toISOString();
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
      
      if (agent.img_url) {
        const escapedName = (agent.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        const escapedDescription = (agent.short_description || agent.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        xml += `    <image:image>
      <image:loc>${agent.img_url}</image:loc>
      <image:title>${escapedName}</image:title>
      <image:caption>${escapedDescription}</image:caption>
    </image:image>
`;
      }
      
      xml += `  </url>
`;
    }

    // ===== ALL OTHER AGENTS =====
    for (const agent of agents) {
      if (!agent.slug || featuredSlugs.has(agent.slug)) continue;
      
      let lastmod = now;
      if (agent.updated_at) {
        try {
          lastmod = new Date(agent.updated_at).toISOString();
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

    // ===== FUNDRAISING COMPANIES =====
    for (const company of companies) {
      let lastmod = now;
      if (company.created_at) {
        try {
          lastmod = new Date(company.created_at).toISOString();
        } catch (e) {
          lastmod = now;
        }
      }
      
      xml += `  <url>
    <loc>${baseUrl}/fundraising/${company.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
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
    console.error('Error generating sitemap:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default function Sitemap() {
  return null;
}

