import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    to: string
    subject: string
    content: string
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

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, content }: EmailRequest = await req.json()

        if (!to || !subject || !content) {
            throw new Error('Missing required parameters')
        }

        // Retrieve SMTP Config securely from Edge Function Environment
        const host = Deno.env.get('SMTP_HOST')
        const port = Number(Deno.env.get('SMTP_PORT')) || 465
        const user = Deno.env.get('SMTP_USER')
        const pass = Deno.env.get('SMTP_PASS')

        if (!host || !user || !pass) {
            throw new Error('Server SMTP Configuration Missing')
        }

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
            conn = await Deno.connectTls({  // 465 relies on implicit TLS
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

        return new Response(
            JSON.stringify({ message: 'Email sent successfully', to, subject }),
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
