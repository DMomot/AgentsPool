// News Sitemap: All news articles
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    // ONE REQUEST to special sitemap endpoint
    const newsRes = await fetch(`${apiUrl}/api/v1/news/sitemap`);
    const newsData = await newsRes.json();
    const newsArticles = newsData.articles || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Main news page
    xml += `  <url>
    <loc>${baseUrl}/news</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    // All News Articles (already filtered by backend)
    for (const article of newsArticles) {
      if (!article.id) continue;
      
      let lastmod = now;
      if (article.published_at) {
        try {
          lastmod = new Date(article.published_at).toISOString();
        } catch (e) {
          if (article.insert_timestamp) {
            try {
              lastmod = new Date(article.insert_timestamp).toISOString();
            } catch (e2) {
              lastmod = now;
            }
          } else {
            lastmod = now;
          }
        }
      }
      
      xml += `  <url>
    <loc>${baseUrl}/news/${article.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
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
    console.error('Error generating news sitemap:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default function SitemapNews() {
  return null;
}

