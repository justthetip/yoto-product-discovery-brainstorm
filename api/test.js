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
    },
    test: 'DIAGNOSTIC_OK'
  };

  return new Response(
    JSON.stringify(diagnostics, null, 2),
    { status: 200, headers: corsHeaders }
  );
}
