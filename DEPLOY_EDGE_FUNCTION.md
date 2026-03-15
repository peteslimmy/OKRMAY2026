# Configure SMTP for Password Reset Emails

## Option 1: Configure SMTP in the App (Recommended)

1. Log in to the OKR Platform
2. Go to **Settings** → **Notification Hub**
3. Enter your SMTP credentials:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **Auth Username**: `peteslimmy@gmail.com`
   - **Security Key**: `tvpvfzckdobosmoe` (your app password without spaces)
4. Click **Save Settings**
5. Test by entering an email and clicking **Test Node**

## Option 2: Deploy Edge Function to Supabase

Run this command in your terminal:

```bash
cd "C:\Users\4Core\Downloads\OKR2026-feb"

npx supabase login
npx supabase functions deploy send-email --project-ref ojuqujjkrmgplqxnmpxe
```

Then set the secrets:

```bash
npx supabase secrets set --project-ref ojuqujjkrmgplqxnmpxe SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=peteslimmy@gmail.com "SMTP_PASS=tvpvfzckdobosmoe"
```

## Gmail App Password Setup

If you need to generate a new App Password:

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Google account
3. Click "Create a new app password"
4. Select "Mail" and "Other (Custom name)"
5. Enter a name like "OKR Platform"
6. Copy the 16-character password (remove spaces when entering)

## Troubleshooting

If password reset emails don't have a link:

1. Check browser console for errors
2. Verify SMTP settings are saved in Settings
3. Check that the edge function is deployed
4. Verify SUPABASE_SERVICE_ROLE_KEY is set in Supabase Dashboard
