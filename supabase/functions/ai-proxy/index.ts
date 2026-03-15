import { GoogleGenAI } from 'https://esm.sh/@google/genai@0.14.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// DEBUG: OpenRouter Configuration Validation - Only enable via environment variable in production
const OPENROUTER_DEBUG = Deno.env.get('OPENROUTER_DEBUG') === 'true';
const SUPPORTED_OPENROUTER_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'google/gemini-pro-1.5',
  'meta-llama/llama-3.1-70b-instruct',
  'mistralai/mistral-7b-instruct',
  'nvidia/nemotron-3-nano-30b'
];

function logOpenRouterDiagnostics(model: string, systemInstruction?: string) {
  console.log('[OPENROUTER_DEBUG] ============================================');
  console.log('[OPENROUTER_DEBUG] Model mapping check:');
  console.log('[OPENROUTER_DEBUG] Current model:', model);
  console.log('[OPENROUTER_DEBUG] Supported models:', SUPPORTED_OPENROUTER_MODELS);
  console.log('[OPENROUTER_DEBUG] Model in supported list:', SUPPORTED_OPENROUTER_MODELS.includes(model));
  console.log('[OPENROUTER_DEBUG] OpenRouter API endpoint: https://openrouter.ai/api/v1/chat/completions');
  console.log('[OPENROUTER_DEBUG] Auth method: Bearer token (OPENROUTER_API_KEY env var)');
  console.log('[OPENROUTER_DEBUG] System instruction: Included in messages array as first message');
  console.log('[OPENROUTER_DEBUG] Request format difference from Gemini:');
  console.log('[OPENROUTER_DEBUG]   - Gemini: { model, contents, config }');
  console.log('[OPENROUTER_DEBUG]   - OpenRouter: { model, messages: [{role: "system", content}, {role: "user", content}] }');
  console.log('[OPENROUTER_DEBUG] ============================================');
}

function getOpenRouterRequestBody(prompt: string, model: string, systemInstruction?: string) {
  const messages: Array<{ role: string, content: string }> = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  return {
    model: model,
    messages: messages,
    temperature: 0.2,
    // OpenRouter-specific options
    route: 'fallback', // Use cheapest available model if selected not available
  };
}

// CORS: Use ALLOWED_ORIGINS env var with fallback to specific domains
function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
  const requestOrigin = req.headers.get('Origin');

  let allowOrigin: string;

  if (allowedOrigins) {
    // If ALLOWED_ORIGINS is set, validate against it
    const allowedList = allowedOrigins.split(',').map(o => o.trim());
    if (requestOrigin && allowedList.includes(requestOrigin)) {
      allowOrigin = requestOrigin;
    } else if (allowedList.includes('*')) {
      // Explicit wildcard in allowed list
      allowOrigin = '*';
    } else {
      // Origin not in allowed list - use first allowed origin (for preflight)
      allowOrigin = allowedList[0] || '';
    }
  } else {
    // No ALLOWED_ORIGINS set - validate against known domains with EXACT matching
    // Only allow known development origins with exact matching
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://localhost:3000',
      'https://localhost:5173',
      'https://127.0.0.1:3000',
      'https://127.0.0.1:5173',
    ];
    // Production domains should be explicitly set via ALLOWED_ORIGINS env var
    if (requestOrigin && devOrigins.includes(requestOrigin)) {
      allowOrigin = requestOrigin;
    } else if (!requestOrigin) {
      // No origin header (non-browser request) - allow for API calls from trusted sources only
      // Require explicit ALLOWED_ORIGINS in production
      allowOrigin = '';
    } else {
      // Unknown origin - restrict to prevent CORS abuse
      allowOrigin = '';
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// Database-backed rate limiting setup
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_AI_PROXY_REQUESTS = 50; // 50 requests per hour per user

// In-memory rate limiting fallback
const inMemoryRateLimits = new Map<string, { count: number; windowStart: number }>();

async function checkAIRateLimit(identifier: string): Promise<boolean> {
  try {
    const now = Date.now();
    const windowStart = new Date(now - RATE_LIMIT_WINDOW).toISOString();

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('rate_limits')
      .select('count, window_start')
      .eq('identifier', identifier)
      .eq('rate_type', 'ai_proxy')
      .gte('window_start', windowStart)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[SECURITY] AI rate limit check failed:', fetchError);
      // Fallback to in-memory with stricter limits
      const memKey = identifier;
      const memEntry = inMemoryRateLimits.get(memKey);

      if (memEntry && (now - memEntry.windowStart) < RATE_LIMIT_WINDOW) {
        if (memEntry.count >= 5) { // Stricter fallback limit
          console.error('[SECURITY] AI rate limit exceeded (in-memory fallback):', memKey);
          return false;
        }
        memEntry.count++;
      } else {
        inMemoryRateLimits.set(memKey, { count: 1, windowStart: now });
      }
      return true;
    }

    const currentCount = existing?.count || 0;

    if (currentCount >= MAX_AI_PROXY_REQUESTS) {
      return false;
    }

    if (existing) {
      await supabaseAdmin
        .from('rate_limits')
        .update({ count: currentCount + 1 })
        .eq('identifier', identifier)
        .eq('rate_type', 'ai_proxy');
    } else {
      await supabaseAdmin
        .from('rate_limits')
        .insert([{
          identifier,
          rate_type: 'ai_proxy',
          count: 1,
          window_start: new Date(now).toISOString()
        }]);
    }

    return true;
  } catch (e) {
    console.error('AI rate limit check error:', e);
    const now = Date.now();
    const memKey = identifier;
    const memEntry = inMemoryRateLimits.get(memKey);

    if (memEntry && (now - memEntry.windowStart) < RATE_LIMIT_WINDOW) {
      if (memEntry.count >= 5) {
        return false;
      }
      memEntry.count++;
    } else {
      inMemoryRateLimits.set(memKey, { count: 1, windowStart: Date.now() });
    }
    return true;
  }
}

// Verify JWT authorization
async function verifyAuthorization(req: Request): Promise<{ valid: boolean; email?: string; userId?: string; error?: string }> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey
      }
    });

    if (!response.ok) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    const userData = await response.json();
    return { valid: true, email: userData.email, userId: userData.id };
  } catch (e) {
    return { valid: false, error: 'Failed to verify token' };
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const authResult = await verifyAuthorization(req);
    if (!authResult.valid) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: ' + authResult.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Rate limiting per user
    const userId = authResult.userId || authResult.email || 'anonymous';
    if (!await checkAIRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: 'Too many AI requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

    // DEBUG: Log OpenRouter configuration status
    if (OPENROUTER_DEBUG) {
      console.log('[OPENROUTER_DEBUG] Environment check:');
      console.log('[OPENROUTER_DEBUG]   GEMINI_API_KEY set:', !!GEMINI_API_KEY);
      console.log('[OPENROUTER_DEBUG]   OPENROUTER_API_KEY set:', !!OPENROUTER_API_KEY);
      if (!OPENROUTER_API_KEY) {
        console.log('[OPENROUTER_DEBUG]   WARNING: To use OpenRouter, set OPENROUTER_API_KEY in Supabase dashboard');
      }
    }

    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { model, messages } = await req.json();

    // DEBUG: Log OpenRouter diagnostic info
    if (OPENROUTER_DEBUG) {
      logOpenRouterDiagnostics(model || 'openai/gpt-4o');
      console.log('[OPENROUTER_DEBUG] Received messages:', messages);
    }

    if (!model || !messages) {
      return new Response(
        JSON.stringify({ error: 'Model and messages are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || 'https://your-project.supabase.co',
        'X-Title': '4CORE AI Assistant',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.2,
        route: 'fallback',
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json();
      console.error('[OPENROUTER] API Error:', errorData);
      throw new Error(`OpenRouter API error: ${errorData.error?.message || openRouterResponse.statusText}`);
    }

    const result = await openRouterResponse.json();

    return new Response(
      JSON.stringify({ text: result.choices[0]?.message?.content || 'No response from AI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'AI service error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
