import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // OpenRouter API key
    const apiKey = "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";
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return res.status(500).json({ error: 'Failed to get AI suggestions' });
    }

    const data = await response.json();
    
    // Extract text from OpenRouter response
    const generatedText = data.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Parse JSON from AI response
    try {
      // Extract JSON from response (remove markdown formatting if present)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : generatedText;
      
      const aiResponse = JSON.parse(jsonString);
      
      // Validate response structure
      if (!aiResponse.suggestions || !Array.isArray(aiResponse.suggestions)) {
        throw new Error('Invalid AI response structure');
      }

      return res.status(200).json(aiResponse);
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', generatedText);
      
      // Fallback: return a basic suggestion structure
      return res.status(200).json({
        suggestions: [
          {
            field: 'short_description',
            value: 'AI-powered tool for enhanced productivity',
            reason: 'Generated fallback suggestion due to parsing error',
            confidence: 0.5
          },
          {
            field: 'description',
            value: 'This AI-powered tool helps enhance productivity and streamline workflows through intelligent automation and smart features.',
            reason: 'Generated fallback description due to parsing error',
            confidence: 0.5
          }
        ]
      });
    }

  } catch (error) {
    console.error('OpenRouter API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
