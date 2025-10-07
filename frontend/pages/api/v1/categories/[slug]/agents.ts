import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { slug } = req.query;
    const { page = '1', limit = '12' } = req.query;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Category slug is required' });
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(
      `${API_BASE_URL}/api/v1/categories/${slug}/agents?page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Category not found' });
      }
      throw new Error(`Backend API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching category agents:', error);
    res.status(500).json({ error: 'Failed to fetch category agents' });
  }
}
