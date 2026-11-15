# Activate adult sign-in

The app includes working Supabase client integration for Google OAuth (PKCE) and email one-time codes. Production authentication is **disabled until a project and providers are configured**. There is no mock login or hard-coded account. Guest practice remains available.

Owner decision on 2026-11-15: finish the app and provide setup steps; no project has been created yet. A readable walkthrough is also live at https://reasonlab.simstart.workers.dev/signin-setup. Email can be enabled independently using only `--email`; Google is optional.

## 1. Create your Supabase project

Create a project in your own Supabase account. Keep its database password private; ReasonLab does not need that password. No database tables are required for this authentication-only release.

Copy the project's HTTPS URL and **publishable** key from the project's API settings. The public key is intended for browser clients. Never use a secret key, service-role key, SMTP password, or Google client secret in this repository or browser code.

## 2. Configure redirect URLs

In Authentication → URL Configuration:

- Site URL: `https://reasonlab.simstart.workers.dev`
- Allowed redirect URL: `https://reasonlab.simstart.workers.dev/account.html`
- For local development only: `http://127.0.0.1:5188/account.html`

Use exact redirect paths, not broad wildcard production redirects. OAuth returns to a fixed same-origin URL and does not accept a redirect supplied by a user/query string.

## 3. Enable email codes

Enable the Email provider and allow new signups. Configure custom SMTP with a verified sending domain. Supabase's default mail delivery is restricted and is not suitable for general public registration. Gmail/Outlook/Yahoo addresses can receive the code; no inbox integration is involved.

Under Authentication → Email Templates → Magic Link, use a code-based template containing `{{ .Token }}` rather than a magic link. For example:

```html
<h2>Your ReasonLab sign-in code</h2>
<p>Enter this one-time code in the tab where you requested it:</p>
<p><strong>{{ .Token }}</strong></p>
<p>If you did not request this code, you can ignore this email.</p>
```

Set an appropriate OTP expiry (for example 10 minutes) and rate limits in the Supabase dashboard. The UI has a 60-second resend delay, but provider-side rate limits enforce abuse protection. Configure CAPTCHA with supported client handling before opening high-volume public registration if needed; it is not implemented in this release.

## 4. Enable Google

In Google Cloud Console, configure OAuth branding/consent and a Web application OAuth client. Set the authorised redirect URI to the **Supabase callback shown in the Google provider panel**, typically:

`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

Enter the Google client ID and secret directly in Supabase Authentication → Providers → Google. Do not put them in ReasonLab. Only identity scopes (`openid email profile`) are requested; no Gmail, Drive, Calendar, or contacts permissions are requested. Configure test users while your Google app is in testing, then complete Google's applicable publishing requirements before general use.

## 5. Set the public configuration

From the repository root:

```powershell
node scripts/configure-auth.mjs --url https://YOUR_PROJECT_REF.supabase.co --key YOUR_PUBLIC_PUBLISHABLE_KEY --email --google
npm ci
npm run build:auth
npm test
npm run deploy
```

The helper rejects secret/service-role keys and non-Supabase endpoints. Both URL and publishable key are public configuration, not credentials. Omit `--google` or `--email` to leave that method disabled until configured. Commit `public/auth-config.js` after updating it; it contains public values only.

## Acceptance checks after setup

1. Sign in with a test adult email, receive an actual code, verify it, and confirm My account appears.
2. Verify wrong/expired codes fail; provider rate limits remain enabled.
3. Sign out; guest history should reappear. Sign back in to see only that adult account's local history.
4. Complete Google sign-in in the same browser tab. Confirm the account and return to practice.
5. Cancel Google consent and verify the app recovers without treating the visitor as signed in.
6. Check Gmail and at least one non-Gmail receiving address using authorised test accounts.

These live-provider checks cannot be completed before you create/configure the service. Automated tests currently exercise integration logic with an injected mock client, not real email delivery or Google consent.

## Data handling and limits

- Accounts belong to adults. The adult checkbox is a declaration, not verified age or legal consent verification.
- Supabase stores the adult authentication identity/email. Google receives the OAuth request when selected.
- Auth tokens use sessionStorage, not localStorage, and persist in the current tab session. A same-tab PKCE return is required.
- No passwords are handled by this app; email codes go directly to Supabase.
- Learning data stays in localStorage, under separate keys for each authenticated user ID; guest keys are unchanged. No automatic guest-data import or cross-device sync occurs.
- Local data is not encrypted or protected from a person with access to browser storage. Sign-in is not a server-side security boundary for these local files. Do not deploy sensitive shared-device records on that assumption.
- For future cloud progress, implement explicit upload consent, database access policies enforcing `auth.uid()`, retention/deletion controls, and provider-backed integration tests before enabling uploads.

## Official references

- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
