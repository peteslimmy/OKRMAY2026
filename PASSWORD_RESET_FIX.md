# Password Reset Fix - Manual Deployment Steps

## Option 1: Deploy Edge Function via Supabase CLI

Run these commands in your terminal:

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link to your project
# (You'll need your project ref from Supabase dashboard URL)
npx supabase link --project-ref ojuqujjkrmgplqxnmpxe

# 3. Deploy the send-email function
npx supabase functions deploy send-email
```

## Option 2: Configure in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Enable **Confirm email**
3. Configure SMTP:
   - **Host:** `wghp2.wghservers.com`
   - **Port:** `465`
   - **Username:** `smtp@oriabure.com`
   - **Password:** `zMfzqVNlH;3.Lbu%`
   - **Encryption:** SSL/TLS

## What's Been Updated

1. ✅ **Auth.tsx** - Now uses your SMTP via edge function
2. ✅ **utils.ts** - Defaults SMTP credentials in localStorage
3. ✅ **supabaseClient.ts** - Added `detectSessionInUrl: true`

## After Deployment

The password reset flow will:
1. User enters email on forgot password page
2. System gets SMTP config from localStorage
3. Edge function sends reset email via your SMTP server
4. User clicks reset link and sets new password
