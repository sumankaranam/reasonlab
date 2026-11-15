# Current status and handoff

Updated: 2026-11-16 (Asia/Kolkata).

## Entry points

- Repository: https://github.com/sumankaranam/reasonlab
- Live Kids app: https://reasonlab.simstart.workers.dev/
- Classic: https://reasonlab.simstart.workers.dev/classic.html
- Adult account: https://reasonlab.simstart.workers.dev/account.html
- Read `AGENTS.md` for the user-requested checkpoint workflow.

## Implemented

Grade 1–10 × three stages; daily and targeted practice; 20-item check-ins; brief digit and reverse-position memory; explanations; local learner separation; learning-map feedback; stage suggestions; downloadable feedback; Classic preserved.

Adult authentication integration: Google OAuth with PKCE, email OTP, adult declaration, local sign-out, verified identity before account-history selection, separate guest/account stores. SDK bundled locally. No inbox scopes, child email collection, cloud progress or backend database.

## Discovery extension (live and verified)

Original 32-question MBTI-style reflection for self-declared ages 16+, 18/36 activity-interest questions by grade, transparent skip-aware scoring, local reports, 24 searchable career families and a detailed family guide. Career ordering uses interests only; practice feedback is separate. See `DISCOVERY-DESIGN.md`. New public email activation walkthrough: `/signin-setup.html`.

## Not active / blockers

**Google sign-in is the first activation target and remains incomplete.** Supabase project `krbuoncrksahcrnufprg` exists. Its public URL and publishable key are configured and deployed. Auth settings were verified with HTTP 200: email enabled, signups enabled (`signupDisabled=false`); Google disabled. Both public app provider flags are false. Google Auth app registration was created successfully in Google Cloud project `reasonlab` (External / Testing). A Web OAuth client is not yet created. Its form is prepared with origin `https://reasonlab.simstart.workers.dev` and callback `https://krbuoncrksahcrnufprg.supabase.co/auth/v1/callback`; it is awaiting action-time permission. After client creation, configure the credentials in Supabase, then enable only the Google flag and deploy. Exact steps are in `AUTH-SETUP.md` and `TECHNICAL-HANDOFF.md`.

No domain purchase, sender domain, SMTP service or email-sender setup is in scope yet. Email remains disabled pending a separate decision. Never describe mock-backed tests as a live login verification. Google Cloud project `reasonlab` and its External / Testing Auth app registration are created. The Web OAuth client form is prepared with the production origin and Supabase callback, but the client has not been created. Google consent/account smoke is still pending.

No IQ calculator or validated age/grade/peer comparison exists. Feedback thresholds and grade mappings are product design choices. No cross-device learning sync. No verified age/consent mechanism. Local history is not encrypted.

## Verification recorded

- 24 automated tests pass locally (Classic, Kids, auth adapter).
- Auth SDK build succeeds; npm reported zero known vulnerabilities at install time.
- Kids live mobile check-in completed: 20 answers, memory removal verified, correct result aggregation and saved feedback.
- History survived reload and switching learner slots did not mix records.
- Grade 10 memory display fits the mobile viewport. Post-auth mobile smoke tests pass: guest return, number practice/feedback, and unsaved-session confirmation before account navigation. The account-unconfigured state is explicit.
- GitHub CI passed for code commit `18a8d76f3cf6786abdad7961619ec297653a9312`: https://github.com/sumankaranam/reasonlab/actions/runs/43637893517
- Real Google consent/account smoke remains pending; prior account smoke passed before this setup attempt.
- Discovery mobile browser checks pass at 390px and 320px: complete interest/preference flows, back/edit, navigation guards, reload persistence, learner separation, search/filter, reports and family exports.
- Additional browser checks pass: all-skipped/no-profile state, deletion, blocked storage, Kids-to-Discovery exit guard, print expansion/restoration and PDF generation. Mobile screenshots inspected.
- GitHub CI passed for Discovery feature checkpoint `c3099da9730cffca267657c4652003c8b628d466`: https://github.com/sumankaranam/reasonlab/actions/runs/43682768019
- Fixed a 320px overflow in the public email setup guide and ensured closed details expand for printing.

## Deployment

Current recorded Cloudflare version: `395ae257-72d1-49ab-ba22-81cf23b7272a`.
Hosting is static assets, Worker name `reasonlab`; no new paid resources created.
The GitHub repository was initially empty. Initial code checkpoint: `18a8d76f3cf6786abdad7961619ec297653a9312` (verify current main before work).

## Next actions

1. Create the prepared Web OAuth client when authorized, then configure its credentials in Supabase. Keep the public Google flag false until configuration is ready.
2. Enable Google only, deploy, and verify a real consent, callback, signed-in account and cancellation recovery flow.
3. Decide separately whether to purchase/use a sender domain and configure SMTP/email OTP.
4. If requested, separately design cloud progress sync and consent/data-deletion controls.

## Commands

```sh
npm ci
npm test
npm run build:auth
npm run dev
npm run deploy
```

Use existing Cloudflare authentication or the normal Wrangler login. Do not copy machine-local auth files into the repository. Read `docs/ARCHITECTURE.md` before changing scoring, identity or memory timing.

Connection checkpoint: 24 automated tests pass. Live browser verified connected/pending account UI and guest-practice navigation. Supabase project and public config are in place; email enabled, `signupDisabled=false`, Google disabled, and both app flags false. Google-first is the current decision. Google Auth app registration is complete; Web OAuth client creation and consent/account smoke are pending. No domain purchase or sender setup has started. See `docs/TECHNICAL-HANDOFF.md`.
