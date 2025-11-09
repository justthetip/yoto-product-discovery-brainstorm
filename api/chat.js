/**
 * Vercel Edge Function for AI-powered product search
 * Optimized for minimal token usage and fast responses
 */

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `You are a helpful shopping assistant for Yoto audio content. You help parents and caregivers find the perfect audio cards for children.

You have access to a catalogue of Yoto products with these fields:
- title: Product name
- author: Creator/author
- blurb: Description
- price: Price in GBP (string like "12.99")
- ageRange: [minAge, maxAge] array
- runtime: Duration in seconds
- contentType: Array of categories (e.g., ["Stories", "Music"])
- availableForSale: Boolean
- flag: Special markers like "New to Yoto"

When helping users:
1. Ask clarifying questions if their request is vague
2. Consider age appropriateness carefully
3. Explain why you recommend specific products
4. Suggest alternatives at different price points
5. Mention runtime to help with activity planning
6. Be concise but friendly

You will receive a pre-filtered set of products that match basic criteria. Your job is to:
- Semantically understand what the user REALLY wants
- Rank products by relevance
- Explain matches in parent-friendly language
- Suggest refinements or alternatives

Format your responses as JSON with this structure:
{
  "message": "Your conversational response to the user",
  "products": [
    {
      "id": "product_id",
      "relevanceScore": 0-100,
      "reasoning": "Why this matches their needs"
    }
  ],
  "suggestions": ["Optional follow-up suggestions"]
}

If you need clarification, return:
{
  "message": "Your question to the user",
  "needsMoreInfo": true
}`;

async function callClaudeAPI(messages, products, apiKey) {
  const productContext = products.slice(0, 50).map(p => ({
    id: p.id,
    title: p.title,
    author: p.author,
    blurb: p.blurb?.substring(0, 200) || '',
    price: p.price,
    ageRange: p.ageRange,
    runtime: p.runtime,
    contentType: p.contentType,
    availableForSale: p.availableForSale,
    flag: p.flag
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        ...messages,
        {
          role: 'user',
          content: `Available products to search:\n${JSON.stringify(productContext, null, 2)}\n\nRespond with JSON only.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = content;
  if (content.includes('```json')) {
    jsonStr = content.split('```json')[1].split('```')[0].trim();
  } else if (content.includes('```')) {
    jsonStr = content.split('```')[1].split('```')[0].trim();
  }

  return JSON.parse(jsonStr);
}

async function callOpenAIAPI(messages, products, apiKey) {
  const productContext = products.slice(0, 50).map(p => ({
    id: p.id,
    title: p.title,
    author: p.author,
    blurb: p.blurb?.substring(0, 200) || '',
    price: p.price,
    ageRange: p.ageRange,
    runtime: p.runtime,
    contentType: p.contentType,
    availableForSale: p.availableForSale,
    flag: p.flag
  }));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        {
          role: 'user',
          content: `Available products to search:\n${JSON.stringify(productContext, null, 2)}\n\nRespond with JSON only.`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const { messages, products, provider = 'anthropic' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!products || !Array.isArray(products)) {
      return new Response(
        JSON.stringify({ error: 'Invalid products format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get API key from environment
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let result;

    if (provider === 'anthropic') {
      if (!anthropicKey) {
        return new Response(
          JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
          { status: 500, headers: corsHeaders }
        );
      }
      result = await callClaudeAPI(messages, products, anthropicKey);
    } else if (provider === 'openai') {
      if (!openaiKey) {
        return new Response(
          JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
          { status: 500, headers: corsHeaders }
        );
      }
      result = await callOpenAIAPI(messages, products, openaiKey);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid provider. Use "anthropic" or "openai"' }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
