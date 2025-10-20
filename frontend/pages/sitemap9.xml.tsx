// Sitemap 9: Fundraising companies
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
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
      // Format date properly
      let lastmod = now;
      if (company.created_at) {
        try {
          const date = new Date(company.created_at);
          lastmod = date.toISOString();
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
    console.error('Error generating sitemap9:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default function Sitemap9() {
  return null;
}

