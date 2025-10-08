import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.agentspool.ai';
    const response = await fetch(`${apiUrl}/api/v1/sitemap-generated.xml`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sitemap');
    }
    
    const xmlData = await response.text();
    
    // Config: application/xml (no charset), WITH XML declaration
    // Like aiagentslist.com
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600');
    
    res.status(200).send(xmlData);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

