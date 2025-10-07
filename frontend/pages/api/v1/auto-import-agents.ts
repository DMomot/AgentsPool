import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const backendResponse = await fetch(`${API_BASE_URL}/api/v1/auto-import-agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        return res.status(backendResponse.status).json(errorData);
      }

      const data = await backendResponse.json();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error('Error proxying auto-import request:', error);
      return res.status(500).json({ error: 'Failed to auto-import agents via backend' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
