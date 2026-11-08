# Google OAuth 2.0 Configuration Guide for TiniWish

This document provides complete instructions for configuring Google OAuth 2.0 authentication for the TiniWish luxury e-commerce platform using Supabase Auth.

---

## Architecture & Authentication Flow

```
1. Customer clicks "Continue with Google" in TiniWish Storefront (/login or /register)
   ↓
2. Supabase Browser Client invokes `supabase.auth.signInWithOAuth({ provider: 'google' })`
   ↓
3. Customer is redirected to Google OAuth Consent Screen
   ↓
4. Customer approves profile & email permissions
   ↓
5. Google redirects to Supabase Auth Callback URL:
   `https://twdyzsnrroiwjiqiilqs.supabase.co/auth/v1/callback`
   ↓
6. Supabase processes authorization code and redirects to TiniWish Callback Handler:
   `/api/auth/callback?code=<session_code>&next=/account`
   ↓
7. `/api/auth/callback` executes:
   a. `supabase.auth.exchangeCodeForSession(code)`
   b. `authService.syncOAuthUser(supabaseUser)` (persists user in Prisma DB with Role.CUSTOMER)
   c. Enforces account status check (ensures isActive is true and deletedAt is null)
   ↓
8. Customer is redirected to `/account` with active HTTP-only session cookies
```

---

## Step 1: Google Cloud Console Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a project: **`TiniWish E-Commerce`**.
3. Navigate to **APIs & Services** > **OAuth consent screen**.
   - User Type: **External**
   - App Name: `TiniWish`
   - User support email: `care@tiniwish.com`
   - App logo: Luxury TiniWish Logo
   - Authorized domains:
     - `supabase.co`
     - `tiniwish.com`
   - Developer contact email: `tech@tiniwish.com`
   - Scopes: Select `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`.
4. Navigate to **APIs & Services** > **Credentials**.
5. Click **+ Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**
   - Name: `TiniWish Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://tiniwish.com`
     - `https://twdyzsnrroiwjiqiilqs.supabase.co`
   - **Authorized redirect URIs**:
     - `https://twdyzsnrroiwjiqiilqs.supabase.co/auth/v1/callback`
6. Click **Create** and securely copy the **Client ID** and **Client Secret**.

---

## Step 2: Supabase Dashboard Configuration

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard/project/twdyzsnrroiwjiqiilqs).
2. Navigate to **Authentication** > **Providers** > **Google**.
3. Toggle **Google enabled** to **ON**.
4. Paste the credentials obtained from Step 1:
   - **Client ID**: `<YOUR_GOOGLE_CLIENT_ID>.apps.googleusercontent.com`
   - **Client Secret**: `<YOUR_GOOGLE_CLIENT_SECRET>`
5. Click **Save**.
6. Navigate to **Authentication** > **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (for local dev) or `https://tiniwish.com` (production)
   - **Redirect URLs** (Add all of the following):
     - `http://localhost:3000/**`
     - `http://localhost:3000/api/auth/callback`
     - `https://tiniwish.com/**`
     - `https://tiniwish.com/api/auth/callback`

---

## Step 3: Environment Variables Checklist

Ensure the following variables are present in your production environment:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://twdyzsnrroiwjiqiilqs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key for SSR Client | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret Key for Server-Side Role Administration | `sb_secret_...` |
| `NEXT_PUBLIC_APP_URL` | Canonical Base URL of TiniWish Application | `http://localhost:3000` or `https://tiniwish.com` |

---

## Step 4: Verification & Security Protections

1. **Privilege Escalation Prevention**:
   - Every user registered via Google OAuth is created with `Role.CUSTOMER` in the database.
   - Client applications cannot supply or manipulate the role parameter.
2. **Account Status Enforcement**:
   - If a deactivated or soft-deleted user attempts to log in via Google OAuth, `syncOAuthUser` rejects the session with HTTP 403 Forbidden.
3. **HTTP-Only Cookies**:
   - `@supabase/ssr` stores tokens in secure, partitioned HTTP cookies inaccessible to client scripts, protecting against XSS attacks.

