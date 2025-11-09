/**
 * Simple diagnostic endpoint to test API configuration
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      hasAnthropicKey: !!anthropicKey,
      keyLength: anthropicKey?.length || 0,
      keyPrefix: anthropicKey?.substring(0, 7) + '***' || 'NOT_SET',
      keyFormat: anthropicKey?.startsWith('sk-ant-') ? 'VALID_FORMAT' : 'INVALID_FORMAT'
    }
  };

  // Try to actually call the Claude API
  try {
    console.log('Testing Claude API call...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: 'Say "test successful" if you can read this.'
        }]
      })
    });

    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      diagnostics.apiTest = {
        success: false,
        status: response.status,
        error: errorText.substring(0, 500)
      };
    } else {
      const data = await response.json();
      diagnostics.apiTest = {
        success: true,
        status: response.status,
        response: data.content[0].text
      };
    }
  } catch (error) {
    console.error('API test error:', error);
    diagnostics.apiTest = {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }

  return new Response(
    JSON.stringify(diagnostics, null, 2),
    { status: 200, headers: corsHeaders }
  );
}
