# Password Reset - Debug Report

## Issue Found
**Error:** `Error sending recovery email`

**Root Cause:** Supabase requires SMTP to be configured in the dashboard to send password reset emails.

## Solution Options

### Option 1: Configure SMTP in Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers** → **Email**
3. Enable **Confirm email** 
4. Enter your SMTP settings:
   - **Host:** `wghp2.wghservers.com`
   - **Port:** `465`
   - **Username:** `smtp@oriabure.com`
   - **Password:** `zMfzqVNlH;3.Lbu%`
   - **Encryption:** SSL/TLS

### Option 2: Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
npx supabase login

# Deploy
npx supabase functions deploy send-email
```

### Option 3: Use Resend (Free Alternative)

1. Sign up at **resend.com**
2. Get your API key (free tier: 3,000 emails/month)
3. Update the edge function to use Resend instead of SMTP

---

## Current Code Status

| Component | Status |
|-----------|--------|
| Auth.tsx | ✅ Updated to use localStorage SMTP |
| utils.ts | ✅ Defaults SMTP in localStorage |
| Edge Function | ❌ Not deployed |
| Supabase SMTP | ❌ Not configured |

The code is ready - just needs SMTP configured in Supabase or edge function deployed.
