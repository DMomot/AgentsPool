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
    
    let xmlData = await response.text();
    
    // Remove XML declaration
    xmlData = xmlData.replace(/<\?xml[^?]*\?>\s*/g, '');
    
    // Set headers: application/xml + nosniff
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    
    res.status(200).send(xmlData);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

