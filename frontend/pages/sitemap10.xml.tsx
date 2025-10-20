// Sitemap 10: Sitemap Index (master sitemap linking all others)
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // All sitemap variants
    const sitemaps = [
      '/sitemap5.xml',
      '/sitemap6.xml',
      '/sitemap7.xml',
      '/sitemap8.xml',
      '/sitemap9.xml',
      '/sitemap2.xml',
    ];

    for (const sitemap of sitemaps) {
      xml += `  <sitemap>
    <loc>${baseUrl}${sitemap}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
`;
    }

    xml += `</sitemapindex>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(xml);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap10:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default function Sitemap10() {
  return null;
}

