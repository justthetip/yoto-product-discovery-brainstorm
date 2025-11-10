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

**CRITICAL: Maintain FULL conversation context**
- Remember ALL requirements mentioned throughout the conversation
- If user first asks for "dinosaurs", then later says "for 5 year olds", recommend "dinosaur content for 5 year olds"
- Combine ALL user preferences from the entire conversation when ranking products
- Never drop previous requirements when new ones are added

**Understanding Pre-Filtered Results**
The products you receive have ALREADY been filtered to match the user's criteria:
- Keywords were matched against title, author, blurb (description), AND content types
- Age ranges were checked for overlap with user's requested age
- Content types were matched to the query

CRITICAL INSTRUCTIONS:
1. CHECK THE BLURB FIELD - Keywords often appear in descriptions, not titles
2. PRESENT relevant products immediately - don't say "I don't see" without checking blurbs first
3. DO NOT ask for refinement if you have 3+ good matches - just present them!
4. Example: "Tales of Tricks and Treats" contains "witches" in the blurb, so it IS a witch story

If you say "I don't see X products" but they exist in the pre-filtered list, you failed to check the blurbs.

**Handling Expanded Results**
Some products may have an 'isExpanded' flag set to true. These are semantically related suggestions that were added when few exact matches were found:
- Expanded results use related keywords (e.g., "prehistoric" for "dinosaur", "galaxy" for "space")
- Expanded results may have broader content types (e.g., "Learning & Education" for "Stories")
- Age range is ALWAYS kept strict - expanded results still match the requested age
- When presenting expanded results, briefly explain they're "related suggestions" or "similar content"
- Prioritize non-expanded results higher, but still include good expanded matches
- Example: "I found 2 dinosaur stories, and also 3 related prehistoric-themed adventures you might enjoy"

You will receive a pre-filtered set of products that match basic criteria. Your job is to:
1. FIRST: Review ALL products carefully - check titles AND blurbs for keywords
2. PRESENT matches immediately if you have 3+ relevant products
3. Rank products by relevance to ALL conversation requirements
4. Explain matches in parent-friendly language (mention when keyword is in description)
5. ONLY ask for refinement if fewer than 3 good matches exist

Remember: Pre-filtering already did the hard work. Your job is to recognize, rank, and present the matches.

CRITICAL: You MUST respond with valid, properly formatted JSON only. No markdown, no extra text.

Format your responses as JSON with this exact structure:
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
}

**Example Response Patterns:**

✅ GOOD - Products exist and are presented immediately:
"I found 3 great witch stories for your 6-year-old!
- 'Tales of Tricks and Treats' by Enid Blyton features wizards and witches in 30 short stories (Ages 5-9)
- 'Stories of Magic and Mischief' has witches and pixies in magical adventures (Ages 5-9)
..."

❌ BAD - Products exist but you're asking for refinement:
"I don't see specific witch-focused story cards. Could you tell me more about what you're looking for?"
↑ This means you didn't check the blurb field! The products ARE there.

JSON formatting rules:
- Use double quotes for ALL string keys and values
- No trailing commas
- Escape special characters in strings
- Ensure all brackets and braces are properly closed`;

async function callClaudeAPI(messages, products, apiKey) {
  // Sanitize text to prevent JSON parsing issues
  const sanitizeText = (text) => {
    if (!text) return '';
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/"/g, "'") // Replace double quotes with single quotes
      .replace(/\\/g, '') // Remove backslashes
      .substring(0, 300);  // Increased to ensure keywords aren't cut off
  };

  const productContext = products.slice(0, 50).map(p => ({
    id: p.id,
    title: sanitizeText(p.title),
    author: sanitizeText(p.author),
    blurb: sanitizeText(p.blurb),
    price: p.price,
    ageRange: p.ageRange,
    runtime: p.runtime,
    contentType: Array.isArray(p.contentType) ? p.contentType.map(ct => sanitizeText(ct)) : [],
    availableForSale: p.availableForSale,
    flag: sanitizeText(p.flag || ''),
    isExpanded: p.isExpanded || false
  }));

  // Get the latest user message for context
  const latestUserMessage = messages.length > 0 && messages[messages.length - 1].role === 'user'
    ? messages[messages.length - 1].content
    : 'user query';

  const requestPayload = {
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      ...messages,
      {
        role: 'user',
        content: `Available products to search:\n${JSON.stringify(productContext, null, 2)}\n\nIMPORTANT: ${productContext.length} products were pre-filtered to match "${latestUserMessage}". Review ALL of them carefully, especially the 'blurb' field which often contains relevant keywords not in the title.\n\nRespond with JSON only.`
      }
    ]
  };

  console.log('📤 Calling Claude API', {
    model: requestPayload.model,
    messageCount: messages.length,
    productContextCount: productContext.length,
    maxTokens: requestPayload.max_tokens,
    requestSize: `${(JSON.stringify(requestPayload).length / 1024).toFixed(2)} KB`
  });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('📥 Claude API response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: {
        'content-type': response.headers.get('content-type'),
        'request-id': response.headers.get('request-id')
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error response', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    console.log('✅ Claude API response parsed', {
      id: data.id,
      model: data.model,
      stopReason: data.stop_reason,
      usage: data.usage,
      contentLength: content.length,
      contentPreview: content.substring(0, 200)
    });

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
      console.log('🔄 Extracted JSON from markdown code block');
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
      console.log('🔄 Extracted JSON from generic code block');
    }

    try {
      const parsedResult = JSON.parse(jsonStr);
      console.log('✅ JSON parsed successfully', {
        hasMessage: !!parsedResult.message,
        productCount: parsedResult.products?.length,
        hasSuggestions: !!parsedResult.suggestions,
        needsMoreInfo: !!parsedResult.needsMoreInfo
      });
      return parsedResult;
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response', {
        error: parseError.message,
        errorPosition: parseError.message.match(/position (\d+)/)?.[1],
        jsonLength: jsonStr.length,
        jsonPreview: jsonStr.substring(0, 1000),
        jsonAroundError: parseError.message.match(/position (\d+)/)
          ? jsonStr.substring(
              Math.max(0, parseInt(parseError.message.match(/position (\d+)/)[1]) - 100),
              Math.min(jsonStr.length, parseInt(parseError.message.match(/position (\d+)/)[1]) + 100)
            )
          : 'N/A'
      });
      throw new Error(`Failed to parse Claude response as JSON: ${parseError.message}`);
    }

  } catch (error) {
    console.error('❌ Claude API call failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
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
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  console.log(`[${requestId}] 🟢 Incoming request`, {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    console.log(`[${requestId}] ✅ CORS preflight response`);
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    console.log(`[${requestId}] ❌ Method not allowed: ${request.method}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const requestBody = await request.json();
    const { messages, products, provider = 'anthropic' } = requestBody;

    console.log(`[${requestId}] 📦 Request payload parsed`, {
      hasMessages: !!messages,
      messageCount: messages?.length,
      hasProducts: !!products,
      productCount: products?.length,
      provider,
      payloadSize: `${(JSON.stringify(requestBody).length / 1024).toFixed(2)} KB`
    });

    if (!messages || !Array.isArray(messages)) {
      console.log(`[${requestId}] ❌ Invalid messages format`, { messages });
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!products || !Array.isArray(products)) {
      console.log(`[${requestId}] ❌ Invalid products format`, { products });
      return new Response(
        JSON.stringify({ error: 'Invalid products format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get API key from environment
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    console.log(`[${requestId}] 🔑 Environment variables check`, {
      hasAnthropicKey: !!anthropicKey,
      anthropicKeyLength: anthropicKey?.length,
      anthropicKeyPrefix: anthropicKey?.substring(0, 10) + '...',
      hasOpenAIKey: !!openaiKey,
      provider
    });

    let result;

    if (provider === 'anthropic') {
      if (!anthropicKey) {
        console.log(`[${requestId}] ❌ ANTHROPIC_API_KEY not configured`);
        return new Response(
          JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log(`[${requestId}] 🤖 Calling Claude API...`);
      const apiStartTime = Date.now();

      try {
        result = await callClaudeAPI(messages, products, anthropicKey);
        const apiTime = Date.now() - apiStartTime;

        console.log(`[${requestId}] ✅ Claude API response received in ${apiTime}ms`, {
          hasMessage: !!result.message,
          messageLength: result.message?.length,
          productCount: result.products?.length,
          hasSuggestions: !!result.suggestions
        });
      } catch (apiError) {
        console.error(`[${requestId}] ❌ Claude API error`, {
          error: apiError.message,
          stack: apiError.stack,
          apiTime: Date.now() - apiStartTime
        });
        throw apiError;
      }

    } else if (provider === 'openai') {
      if (!openaiKey) {
        console.log(`[${requestId}] ❌ OPENAI_API_KEY not configured`);
        return new Response(
          JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log(`[${requestId}] 🤖 Calling OpenAI API...`);
      result = await callOpenAIAPI(messages, products, openaiKey);

    } else {
      console.log(`[${requestId}] ❌ Invalid provider: ${provider}`);
      return new Response(
        JSON.stringify({ error: 'Invalid provider. Use "anthropic" or "openai"' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Request completed successfully in ${totalTime}ms`);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;

    console.error(`[${requestId}] ❌ Chat API error (${totalTime}ms)`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        requestId
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
