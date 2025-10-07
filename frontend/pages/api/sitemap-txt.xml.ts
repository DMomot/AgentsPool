import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://agentspool.ai/</loc>
  </url>
  <url>
    <loc>https://agentspool.ai/catalog</loc>
  </url>
  <url>
    <loc>https://agentspool.ai/categories</loc>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(xmlContent);
}
