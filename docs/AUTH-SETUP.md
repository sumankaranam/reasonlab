# Activate adult sign-in

Owner-only project documentation: these steps are not deployed on the public learning website. The public setup walkthrough and owner activation link were removed on 2026-11-16. Only `public/` is uploaded to Cloudflare. These files remain available locally in this checkout (and as documentation in the source repository).

The app includes Supabase client integration for Google OAuth (PKCE) and email one-time codes. Production authentication stays disabled until a provider is configured. There is no mock login or hard-coded account. Guest practice remains available.

Updated 2026-11-15: The current decision is Google sign-in first. Supabase project `krbuoncrksahcrnufprg` has public URL/publishable-key configuration saved and deployed. Its Auth settings endpoint returned HTTP 200: email enabled, signups enabled (`signupDisabled=false`), Google disabled. Both app provider flags remain false. The email sender/domain decision is deferred; do not purchase a domain or start a paid plan as part of Google setup. See `TECHNICAL-HANDOFF.md` for exact next steps.

## 1. Create your Supabase project

Create a project in your own Supabase account. Keep its database password private; ReasonLab does not need that password. No database tables are required for this authentication-only release.

Copy the project's HTTPS URL and **publishable** key from the project's API settings. The public key is intended for browser clients. Never use a secret key, service-role key, SMTP password, or Google client secret in this repository or browser code.

## 2. Configure redirect URLs

In Authentication → URL Configuration:

- Site URL: `https://reasonlab.simstart.workers.dev`
- Allowed redirect URL: `https://reasonlab.simstart.workers.dev/account.html`
- For local development only: `http://127.0.0.1:5188/account.html`

Use exact redirect paths, not broad wildcard production redirects. OAuth returns to a fixed same-origin URL and does not accept a redirect supplied by a user/query string.

## 3. Enable email codes (deferred)

Email OTP requires a verified sender domain and custom SMTP for general public registration. Setup is deliberately deferred while Google is the first target. Do not enable the email app flag yet. When email setup is authorized, configure the Magic Link template to include `{{ .Token }}`, appropriate OTP expiry and provider-side rate limits. Gmail/Outlook/Yahoo addresses can receive the code; no inbox integration is involved.

## 4. Enable Google

In Google Cloud Console, configure OAuth branding/consent and create a Web application OAuth client. Add the callback URL below as an authorized redirect URI:

`https://krbuoncrksahcrnufprg.supabase.co/auth/v1/callback`

In Supabase Authentication → Providers → Google, enable the provider and enter the Google client ID and secret directly in Supabase. Never put either value in ReasonLab or its Git history. Request only identity scopes (`openid email profile`); no Gmail, Drive, Calendar or contacts permissions are requested. Configure test users while the Google app is in testing, then complete Google's applicable publishing requirements before general use.

Also set Supabase Authentication → URL Configuration to the production Site URL and exact allowed redirect URL in section 2. Follow the operational sequence in `TECHNICAL-HANDOFF.md`.

## 5. Public app configuration

From the repository root, use the helper only after Google provider setup is ready:

```powershell
node scripts/configure-auth.mjs --url https://YOUR_PROJECT_REF.supabase.co --key YOUR_PUBLIC_PUBLISHABLE_KEY --google
npm ci
npm run build:auth
npm test
npm run deploy
```

The helper rejects secret/service-role keys and non-Supabase endpoints. The URL and publishable key are public configuration, not credentials. Do not pass `--email` until a sender is configured and email activation is separately decided. `public/auth-config.js` contains public values only; never place provider secrets there.

## Acceptance checks after setup

1. Complete Google consent with an authorized adult test account and return to `/account.html` in the same browser tab.
2. Confirm the account appears, sign out, and verify guest history reappears. Sign back in to see only that adult account's local history.
3. Cancel Google consent and verify the app recovers without treating the visitor as signed in.
4. Confirm no child account or child email is used. Repeat in a fresh browser session if the first test is affected by an existing session.

These live-provider checks cannot be established by automated tests with an injected mock client. Record live consent and account smoke results only after completing them.

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

## Suggested sender: Resend (deferred)

Email sender setup is outside the current Google-first activation. The owner has not chosen or purchased a domain. Do not buy a domain or start a paid plan without explicit approval.

If later authorized and a domain is available: verify a sending subdomain such as `auth.example.com` with the exact DNS records supplied by the mail provider, preserve existing mail records, then enter SMTP credentials directly in Supabase. Never store SMTP/API secrets in this repository. Resend supports SMTP and requires a domain owned by the sender.

References: https://resend.com/docs/send-with-smtp and https://resend.com/docs/dashboard/domains/introduction . No email has been sent or live sign-in verified at this checkpoint.
