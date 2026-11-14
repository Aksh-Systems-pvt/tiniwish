# Google OAuth 2.0 Direct Authentication Guide for TiniWish

This document provides complete instructions for configuring direct Google OAuth 2.0 authentication for TiniWish.

The authentication flow connects **directly to Google** (`accounts.google.com`) without routing user browser traffic through Supabase URL redirects, while maintaining complete session and database synchronization.

---

## Direct Authentication Architecture

```
1. Customer clicks "Continue with Google" (/login or /register)
   ↓
2. Browser navigates to TiniWish direct route:
   `/api/auth/google?next=/account`
   - Generates cryptographically secure CSRF state token
   - Sets secure httpOnly cookie `google_oauth_state`
   ↓
3. TiniWish redirects browser directly to Google:
   `https://accounts.google.com/o/oauth2/v2/auth?...`
   (Supabase is NOT in the browser redirect chain)
   ↓
4. Customer signs in and approves profile/email permissions on Google
   ↓
5. Google redirects browser directly back to TiniWish:
   `http://localhost:3000/api/auth/google/callback?code=...&state=...`
   ↓
6. `/api/auth/google/callback` route handler:
   a. Validates CSRF state against the httpOnly cookie
   b. Exchanges authorization code directly with Google `https://oauth2.googleapis.com/token`
   c. Fetches verified user info from Google `https://www.googleapis.com/oauth2/v3/userinfo`
   d. Provisions session cookies via server-side OTP bridge
   e. Synchronizes customer in Prisma database with `Role.CUSTOMER`
   ↓
7. Customer is redirected to their destination (`/account` or `/checkout`) logged in!
```

---

## Step 1: Google Cloud Console Setup

1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select or create your project: **`TiniWish E-Commerce`**.
3. Configure the **OAuth consent screen** under **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**
   - App Name: `TiniWish`
   - User support email: `care@tiniwish.com`
   - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
4. Under **APIs & Services** > **Credentials**, click **+ CREATE CREDENTIALS** > **OAuth client ID**:
   - Application type: **Web application**
   - Name: `TiniWish Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://tiniwish.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://tiniwish.com/api/auth/google/callback` (for production)
5. Click **Create** and copy your **Client ID** and **Client Secret**.

---

## Step 2: Configure Environment Variables

Add the credentials to your `.env` (or `.env.local`) file:

```env
# Google OAuth 2.0 (Direct Authentication)
GOOGLE_CLIENT_ID="<your_client_id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<your_client_secret>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Step 3: Security Protections Built-In

1. **CSRF Protection**:
   - Every login initiation generates a 32-byte cryptographically random token (`crypto.randomBytes(32)`).
   - Stored in a strict, httpOnly cookie (`google_oauth_state`) with a 10-minute expiry and validated upon callback.
2. **Email Verification Requirement**:
   - Only Google accounts with `email_verified: true` are permitted to authenticate.
3. **Privilege Escalation Prevention**:
   - All OAuth registrations are strictly enforced as `Role.CUSTOMER`.
4. **Deactivated Account Enforcement**:
   - Inactive or soft-deleted customer profiles are barred with HTTP 403 Forbidden.
5. **No Supabase Auth Dashboard Dependency**:
   - Does not require enabling third-party provider toggles in Supabase dashboard because authentication verification is managed directly through server-side authorization.
