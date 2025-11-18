// Simple Sitemap: Categories + Agents from API
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agentspool.ai';
    const baseUrl = 'https://agentspool.ai';
    const now = new Date().toISOString();

    // Fetch categories
    const categoriesRes = await fetch(`${apiUrl}/api/v1/categories`);
    const categories = await categoriesRes.json();

    // Fetch ALL agents with pagination (API max limit is 2000)
    const agents = [];
    let page = 1;
    const limit = 2000;
    let hasMore = true;

    while (hasMore) {
      const agentsRes = await fetch(`${apiUrl}/api/v1/agents?limit=${limit}&page=${page}`);
      const agentsData = await agentsRes.json();
      const pageAgents = agentsData.agents || [];
      
      if (pageAgents.length > 0) {
        agents.push(...pageAgents);
        page++;
        hasMore = agentsData.has_next || false;
      } else {
        hasMore = false;
      }
    }

    // Fetch ALL news articles with pagination (max limit is 100)
    const newsArticles = [];
    let newsPage = 1;
    let hasMoreNews = true;

    while (hasMoreNews) {
      const newsRes = await fetch(`${apiUrl}/api/v1/news?limit=100&page=${newsPage}`);
      const newsData = await newsRes.json();
      const pageNews = newsData.news || [];
      
      if (pageNews.length > 0) {
        newsArticles.push(...pageNews);
        newsPage++;
        hasMoreNews = newsData.has_next || false;
      } else {
        hasMoreNews = false;
      }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Main pages
    const mainPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/catalog', priority: '0.9', changefreq: 'daily' },
      { url: '/categories', priority: '0.9', changefreq: 'daily' },
      { url: '/agents', priority: '0.9', changefreq: 'daily' },
      { url: '/news', priority: '0.9', changefreq: 'daily' },
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

    // Browse pages
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    for (const letter of letters) {
      xml += `  <url>
    <loc>${baseUrl}/agents/browse/${letter}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Numbers page
    xml += `  <url>
    <loc>${baseUrl}/agents/browse/numbers</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;


    // ALL Agents
    for (const agent of agents) {
      if (!agent.slug) continue;
      
      let lastmod = now;
      if (agent.updated_at) {
        try {
          lastmod = new Date(agent.updated_at).toISOString();
        } catch (e) {
          lastmod = now;
        }
      }
      
      const priority = agent.featured ? '0.9' : '0.6';
      const changefreq = agent.featured ? 'daily' : 'weekly';
      
      xml += `  <url>
    <loc>${baseUrl}/${agent.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    }

    // ALL News Articles
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
