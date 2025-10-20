// Sitemap 5: Only main pages + categories (high priority)
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentspool.ai';
    
    // Fetch categories
    const categoriesRes = await fetch(`${apiUrl}/api/v1/categories`);
    const categories = await categoriesRes.json();

    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Main pages - highest priority
    const mainPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/catalog', priority: '0.9', changefreq: 'daily' },
      { url: '/categories', priority: '0.9', changefreq: 'daily' },
      { url: '/agents', priority: '0.9', changefreq: 'daily' },
      { url: '/fundraising', priority: '0.8', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
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

    // Categories
    for (const category of categories) {
      xml += `  <url>
    <loc>${baseUrl}/${category.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
    console.error('Error generating sitemap5:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default function Sitemap5() {
  return null;
}

