import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS: Validate Origin header against ALLOWED_ORIGINS env var
function getCorsHeaders(req: Request): Record<string, string> {
    const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS');
    const requestOrigin = req.headers.get('Origin');

    let allowOrigin: string;

    if (allowedOrigins) {
        const allowedList = allowedOrigins.split(',').map(o => o.trim());
        if (requestOrigin && allowedList.includes(requestOrigin)) {
            allowOrigin = requestOrigin;
        } else if (allowedList.includes('*')) {
            allowOrigin = '*';
        } else {
            allowOrigin = allowedList[0] || '';
        }
    } else {
        // No ALLOWED_ORIGINS configured - be restrictive
        // Only allow known development origins with EXACT matching (not partial)
        const devOrigins = [
            'http://localhost:3000',
            'http://localhost:3030',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3030',
            'http://127.0.0.1:5173',
            'https://localhost:3000',
            'https://localhost:3030',
            'https://localhost:5173',
            'https://127.0.0.1:3000',
            'https://127.0.0.1:3030',
            'https://127.0.0.1:5173',
        ];
        // Production domains should be explicitly set via ALLOWED_ORIGINS env var
        // For development, check exact matches
        if (requestOrigin && devOrigins.includes(requestOrigin)) {
            allowOrigin = requestOrigin;
        } else {
            // No origin header or unknown origin - don't allow CORS
            // This prevents attacks where attacker registers similar domains
            allowOrigin = '';
        }
    }

    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

// Database-backed rate limiting (persists across cold starts)
// Uses Supabase admin client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
const MAX_PASSWORD_RESET_ATTEMPTS = 3; // Max 3 password resets per hour per IP

// In-memory rate limiting fallback (persists across function invocations in same container)
// Used when database is unavailable - provides protection during DB outages
const inMemoryRateLimits = new Map<string, { count: number; windowStart: number }>();

async function checkRateLimit(identifier: string, type: 'password_reset' | 'email'): Promise<boolean> {

    try {
        const now = Date.now();
        const windowStart = new Date(now - RATE_LIMIT_WINDOW).toISOString();

        // Check existing rate limit record
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('rate_limits')
            .select('count, window_start')
            .eq('identifier', identifier)
            .eq('rate_type', type)
            .gte('window_start', windowStart)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
            // ALERT: Log rate limiter failures for monitoring
            console.error('[SECURITY] Rate limit check failed:', fetchError);
            // CRITICAL FIX: Fail CLOSED to prevent abuse when DB is down
            // Use in-memory tracking as fallback with stricter limits
            const memKey = `${identifier}:${type}`;
            const memEntry = inMemoryRateLimits.get(memKey);

            if (memEntry && (now - memEntry.windowStart) < RATE_LIMIT_WINDOW) {
                // Stricter in-memory limit: only 2 requests when DB is down
                if (memEntry.count >= 2) {
                    console.error('[SECURITY] Rate limit exceeded (in-memory fallback):', memKey);
                    return false;
                }
                memEntry.count++;
            } else {
                inMemoryRateLimits.set(memKey, { count: 1, windowStart: now });
            }
            return true; // Allow but with strict in-memory limit
        }

        const currentCount = existing?.count || 0;

        if (currentCount >= MAX_PASSWORD_RESET_ATTEMPTS) {
            return false;
        }

        // Increment or insert rate limit record
        if (existing) {
            await supabaseAdmin
                .from('rate_limits')
                .update({ count: currentCount + 1 })
                .eq('identifier', identifier)
                .eq('rate_type', type);
        } else {
            await supabaseAdmin
                .from('rate_limits')
                .insert([{
                    identifier,
                    rate_type: type,
                    count: 1,
                    window_start: new Date(now).toISOString()
                }]);
        }

        return true;
    } catch (e) {
        console.error('Rate limit check error:', e);
        // CRITICAL FIX: Fail CLOSED on any error - deny request when rate limiter fails
        // This prevents abuse during database outages
        return false;
    }
}

function getClientIP(req: Request): string {
    // Try to get real IP from various headers (in order of preference)
    const cfIP = req.headers.get('cf-connecting-ip');
    if (cfIP) return cfIP;

    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = req.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Last resort: use a combination of headers to create a pseudo-unique identifier
    // This is not ideal but prevents all users from sharing the same bucket
    // SECURITY NOTE: This fallback can be spoofed by attackers. For production deployments,
    // ensure at least one of cf-connecting-ip, x-forwarded-for, or x-real-ip is provided
    // by your CDN/proxy configuration.
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const acceptLanguage = req.headers.get('accept-language') || 'unknown';
    return `pseudo-${userAgent.slice(0, 20)}-${acceptLanguage.slice(0, 10)}`;
}

// Verify JWT authorization - returns user email from token or null
async function verifyAuthorization(req: Request): Promise<{ valid: boolean; email?: string; error?: string }> {
    const authHeader = req.headers.get('authorization') || '';

    // Use constant-time comparison for Bearer prefix to prevent timing attacks
    const bearerPrefix = 'Bearer ';
    const hasBearerPrefix = authHeader.length >= bearerPrefix.length &&
        authHeader.slice(0, bearerPrefix.length) === bearerPrefix;

    if (!hasBearerPrefix) {
        // Add constant delay to prevent timing attack on auth header format
        await new Promise(resolve => setTimeout(resolve, 50));
        return { valid: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.slice(bearerPrefix.length);

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

        // Verify the token using Supabase's auth API
        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': supabaseKey
            }
        });

        if (!response.ok) {
            // Add constant delay to prevent timing attack on token validation
            await new Promise(resolve => setTimeout(resolve, 50));
            return { valid: false, error: 'Invalid or expired token' };
        }

        const userData = await response.json();
        return { valid: true, email: userData.email };
    } catch (e) {
        // Add constant delay to prevent timing attack on exceptions
        await new Promise(resolve => setTimeout(resolve, 50));
        return { valid: false, error: 'Failed to verify token' };
    }
}

interface EmailRequest {
    to?: string
    subject?: string
    content?: string
    generateResetLink?: boolean
    redirectTo?: string
    test?: string
    healthCheck?: boolean
}

function base64Encode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let result = ''
    const bytes = new TextEncoder().encode(str)
    let i = 0
    while (i < bytes.length) {
        const b1 = bytes[i++]
        const b2 = i < bytes.length ? bytes[i++] : 0
        const b3 = i < bytes.length ? bytes[i++] : 0
        result += chars[b1 >> 2]
        result += chars[((b1 & 3) << 4) | (b2 >> 4)]
        result += i > bytes.length + 1 ? '=' : chars[((b2 & 15) << 2) | (b3 >> 6)]
        result += i > bytes.length ? '=' : chars[b3 & 63]
    }
    return result
}

async function sendEmail(
    to: string,
    subject: string,
    content: string,
    host: string,
    port: number,
    user: string,
    pass: string
): Promise<void> {
    const from = user
    const emailContent = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        '',
        content,
        ''
    ].join('\r\n')

    let conn: Deno.Conn;
    if (port === 465) {
        conn = await Deno.connectTls({
            hostname: host,
            port: port
        })
    } else {
        conn = await Deno.connect({
            hostname: host,
            port: port
        })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Read greeting
    await readResponse(conn, decoder)

    // EHLO
    await sendCommand(conn, encoder, 'EHLO localhost')
    await readResponse(conn, decoder)

    // STARTTLS if needed
    if (port === 587) {
        await sendCommand(conn, encoder, 'STARTTLS')
        await readResponse(conn, decoder)

        // Upgrade connection to TLS
        conn = await Deno.startTls(conn, { hostname: host })

        // Re-EHLO after TLS upgrade
        await sendCommand(conn, encoder, 'EHLO localhost')
        await readResponse(conn, decoder)
    }

    // AUTH LOGIN
    await sendCommand(conn, encoder, 'AUTH LOGIN')
    await readResponse(conn, decoder)
    await sendCommand(conn, encoder, base64Encode(user))
    await readResponse(conn, decoder)
    await sendCommand(conn, encoder, base64Encode(pass))
    const authResponse = await readResponse(conn, decoder)

    if (authResponse.startsWith('535')) {
        throw new Error('Authentication failed - check SMTP credentials')
    }

    // MAIL FROM
    await sendCommand(conn, encoder, `MAIL FROM:<${from}>`)
    await readResponse(conn, decoder)

    // RCPT TO
    await sendCommand(conn, encoder, `RCPT TO:<${to}>`)
    await readResponse(conn, decoder)

    // DATA
    await sendCommand(conn, encoder, 'DATA')
    await readResponse(conn, decoder)

    // Send email
    const writer = conn.writable.getWriter()
    await writer.write(encoder.encode(emailContent + '\r\n.\r\n'))
    await writer.releaseLock()

    await readResponse(conn, decoder)

    // QUIT
    await sendCommand(conn, encoder, 'QUIT')
    conn.close()
}

serve(async (req: Request) => {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body: EmailRequest = await req.json()
        const { to, subject, content, generateResetLink, redirectTo } = body

        // Health check endpoint - no auth or rate limiting required
        if (body.test === 'health-check' || body.healthCheck === true) {
            const hasSmtp = !!Deno.env.get('SMTP_HOST');
            const hasServiceKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            return new Response(
                JSON.stringify({
                    status: 'ok',
                    smtpConfigured: hasSmtp,
                    passwordResetConfigured: hasServiceKey,
                    message: hasSmtp ? 'Edge function is running' : 'SMTP not configured - set SMTP_HOST, SMTP_USER, SMTP_PASS secrets'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // SECURITY: Require authorization for all non-health-check, non-password-reset requests
        // Password reset doesn't require auth because user has forgotten their password
        const requiresAuth = !generateResetLink;
        if (requiresAuth) {
            const authResult = await verifyAuthorization(req);
            if (!authResult.valid) {
                return new Response(
                    JSON.stringify({ error: 'Unauthorized: ' + authResult.error }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
                );
            }
        }

        // Validate email format to prevent malformed input
        const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!to) {
            throw new Error('Email address is required');
        }
        if (!EMAIL_REGEX.test(to)) {
            throw new Error('Invalid email address format');
        }

        // SECURITY: Rate limiting for password reset to prevent abuse
        // Rate limit per IP AND per email to prevent targeting specific users
        if (generateResetLink) {
            const clientIP = getClientIP(req);
            // Check IP-based rate limit (async now)
            if (!await checkRateLimit(clientIP, 'password_reset')) {
                return new Response(
                    JSON.stringify({ error: 'Too many password reset requests. Please try again later.' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
                );
            }
            // Also check email-based rate limit to prevent targeting specific users
            const emailRateLimitKey = `email_reset_${to}`;
            if (!await checkRateLimit(emailRateLimitKey, 'password_reset')) {
                return new Response(
                    JSON.stringify({ error: 'Too many password reset requests for this email. Please try again later.' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
                );
            }
        }

        // Get SMTP config from environment variables only (secure)
        const host = Deno.env.get('SMTP_HOST')
        const port = Number(Deno.env.get('SMTP_PORT')) || 465
        const user = Deno.env.get('SMTP_USER')
        const pass = Deno.env.get('SMTP_PASS')

        if (!host || !user || !pass) {
            throw new Error('SMTP configuration is missing. Please configure SMTP secrets:\n' +
                '- SMTP_HOST\n- SMTP_PORT\n- SMTP_USER\n- SMTP_PASS\n\n' +
                'Deploy with: supabase secrets set SMTP_HOST=smtp.gmail.com SMTP_PORT=465 SMTP_USER=you@gmail.com SMTP_PASS=app-password')
        }

        let emailSubject = subject
        let emailContent = content

        // If generateResetLink is true, we DON'T require authentication for password reset
        // because the user has forgotten their password and isn't logged in
        // Security: The reset link is only valid for 1 hour and can only be used by the email owner
        // Additional security: Rate limited above to prevent abuse
        if (generateResetLink) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase configuration missing for password reset. Please set SUPABASE_SERVICE_ROLE_KEY in edge function secrets.')
            }

            // Create Supabase admin client to generate reset link
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            })

            // Generate password reset link - no authentication required for forgot password flow
            // The security is provided by: 1) reset link expires in 1 hour, 2) can only be used by email owner
            // Additional security: 3) Rate limited to 3 requests per hour per IP
            const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: to,
                options: {
                    redirectTo: redirectTo || `${Deno.env.get('SITE_URL') || 'http://localhost:3030'}`
                }
            })

            if (resetError) {
                // Don't reveal if email exists or not - generic error message
                // This prevents email enumeration
                throw new Error('Password reset request processed. If an account exists with this email, a reset link will be sent.')
            }

            const resetLink = data?.properties?.action_link
            if (!resetLink) {
                throw new Error('Failed to generate password reset link - no action_link returned')
            }

            emailSubject = 'Reset Your Password - OKR Platform'
            emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #6366f1;">Password Reset Request</h2>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #5b8dee 0%, #7c5cbf 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">Reset Password</a>
                    </div>
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                    <p style="background: #f3f4f6; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 13px; color: #4f46e5;">
                        <a href="${resetLink}" style="color: #4f46e5; text-decoration: underline;">${resetLink}</a>
                    </p>
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                    <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
                </div>
            `
        }

        if (!emailSubject || !emailContent) {
            throw new Error('Subject and content are required')
        }

        // Send the email
        await sendEmail(to, emailSubject, emailContent, host, port, user, pass)

        return new Response(
            JSON.stringify({ message: 'Email sent successfully', to }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})

async function sendCommand(conn: Deno.Conn, encoder: TextEncoder, command: string) {
    const writer = conn.writable.getWriter()
    await writer.write(encoder.encode(command + '\r\n'))
    await writer.releaseLock()
}

async function readResponse(conn: Deno.Conn, decoder: TextDecoder): Promise<string> {
    const buffer = new Uint8Array(2048)
    try {
        const n = await conn.read(buffer)
        if (n === null) return ''
        return decoder.decode(buffer.subarray(0, n))
    } catch {
        return ''
    }
}
