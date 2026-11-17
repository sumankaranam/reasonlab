# Technical handoff: Google sign-in first

Public owner-setup UI was removed on 2026-11-16 at the user's request. Continue configuration from this local document and `AUTH-SETUP.md`; there is no configuration page in the deployed learner app. French learning is a separate guest-compatible feature; see `FRENCH-DESIGN.md` and `STATUS.md` for its implementation and validation.

Earlier setup checkpoint (superseded by activation update below): Supabase project `krbuoncrksahcrnufprg` is configured in the public app and deployed. Supabase Auth settings were read successfully (HTTP 200): email enabled, signups enabled (`signupDisabled=false`), Google disabled. Both app provider flags are false. Prior account smoke passed before this setup attempt; the current real Google consent/account smoke is pending. Google Cloud project `reasonlab` has a successfully created External / Testing Auth app registration. The Web OAuth client `Web client 1` was created successfully with explicit user approval on 2026-11-16. Its origin is `https://reasonlab.simstart.workers.dev`; its callback is `https://krbuoncrksahcrnufprg.supabase.co/auth/v1/callback`. Google returned an OAuth-client-created confirmation. Credentials are not in the repository. Supabase still displays Google DISABLED. The owner must complete provider and redirect configuration: the available Windows automation skill prohibits changing in-app security settings. No live login verification or new deployment occurred at this checkpoint.

## Setup sequence (provider setup completed by owner)

1. In Google Cloud Console project `reasonlab`, use the existing Web application OAuth client `Web client 1`; do not create a duplicate. The app is External / Testing. The support/developer contact is configured, but the test-user list has not been verified. The owner should add an authorised adult test user if required. Request identity scopes only (`openid email profile`). Google warned that the new secret is only shown at creation; it was retained temporarily in the active automation session, not persisted. If unavailable in a future session, manage a replacement secret manually in Google Console rather than asking for it in chat.

2. In Supabase project `krbuoncrksahcrnufprg`, open Authentication → Providers → Google. Enable Google and enter the OAuth client ID and client secret in Supabase only. Never copy the client secret into repository files, browser config, shell history, screenshots, or Git.

3. In Supabase Authentication → URL Configuration, set Site URL to `https://reasonlab.simstart.workers.dev` and allow the exact redirect `https://reasonlab.simstart.workers.dev/account.html`. Keep broad wildcard production redirects disabled.

4. In the repository, confirm the configured public Supabase URL/key are the expected public values, then enable Google only:

   ```powershell
   node scripts/configure-auth.mjs --url https://krbuoncrksahcrnufprg.supabase.co --key YOUR_PUBLIC_PUBLISHABLE_KEY --google
   npm run build:auth
   npm test
   npm run deploy
   ```

   Use the already configured public publishable key locally; do not place it in this handoff. Do not pass `--email`. Never place provider secrets in code. Inspect `public/auth-config.js` and the diff before any checkpoint.

5. Open the live app at `https://reasonlab.simstart.workers.dev/account.html` and use an authorized adult test account. Verify successful consent/callback in the same tab, account display, sign-out back to guest history, and cancellation recovery. Record the observed result in `docs/STATUS.md`; do not claim live success based only on mocks or configuration screens.

## Deferred

Email OTP, sender-domain selection/purchase, SMTP, sender DNS and email templates are not part of this activation. No domain has been selected or purchased, and no mail sender has been configured. Decide on those separately before enabling the email app flag or spending money. Cloud progress sync is also out of scope.

## Safety and workflow

Google client ID/secret and any SMTP/API credential belong only in their provider dashboards. Keep all secrets out of code, docs, screenshots and Git. Preserve unrelated work and existing uncommitted changes. Follow `AGENTS.md`: stronger-model planning/review, lighter-model bounded implementation/testing when suitable; actual billing savings remain unverified. The standing authorization covers periodic pushes of tested milestones; follow the required diff, checks and secret scan before pushing.

## Google activation update — 2026-11-16

Owner reports provider configured. Public Supabase settings verified HTTP 200, Google enabled, signups enabled. App configuration now enables Google only; email stays disabled. Complete a real Google login in the same tab and verify account identity, French account progress, sign-out and cancellation. Prior setup-pending descriptions above document historical steps. No cross-device sync or guest-data import is enabled.

Activation release: Cloudflare `cf0fcba0-d9cd-4ad9-a2a8-0744f2b7aaac`. All 62 tests and auth SDK build pass; vendor bundle unchanged. Live mobile smoke passed Google button/adult gate, disabled email, real redirect to Google, cancellation error UI and French guest navigation. Actual Google consent/callback and signed-in identity remain user-verification steps.

## Tamil/Kannada extension

See `LANGUAGE-COURSES.md` for scope and review limitations. Keep French data/engine independent. For more languages, extend the shared Indic course engine only after adding authored data, script-compatible layout checks and explicit voice locale support. Update the hub, global course selector, usage allowlist/schema/view, retention and tests together. Do not store child audio or claim pronunciation/fluency scores.

## Reasoning Adventures extension

Entry `/adventures.html`; existing grade-specific `/kids.html` retained. Read `REASONING-ADVENTURES.md` before changing generation, scoring, memory timing or evidence rules. Main tests: `tests/adventure.test.mjs`, `tests/browser/adventures.mjs`, shared landing and theme-contrast suites. No runtime AI dependency or new provider setup. Histories are local and separate from legacy Kids. Owner email reports continue to require the deferred sender setup.

## Daily home, review and cloud milestone

Read `CLOUD-PROGRESS.md` and `LEARNING-TODAY-AND-REVIEW.md`. Migration 0004 must precede API deployment. Public ownership/setup UI remains absent: Account has parent data controls, not provider configuration. New progress API uses only the public Supabase config and verifies each caller; do not add service secrets to browser code. Optional cloud saves deliberately exclude unfinished work and Discovery/Classic. Before changing DTOs, add a version/migration strategy and preserve account/key boundaries.
