# Current status and handoff

Updated: 2026-11-15 (Asia/Kolkata).

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

Original 32-question MBTI-style reflection for self-declared ages 16+, 18/36 activity-interest questions by grade, transparent skip-aware scoring, local reports, 24 searchable career families and a detailed family guide. Career ordering uses interests only; practice feedback is separate. See `DISCOVERY-DESIGN.md`. New public email activation walkthrough: `/signin-setup.html`. User chose to finish the app and provide setup steps rather than configure a provider now.

## Not active / blockers

**Google/email login cannot complete yet.** No Supabase project, SMTP delivery or Google OAuth client has been configured. `public/auth-config.js` is deliberately empty and the live account page must disclose that state. Follow `AUTH-SETUP.md` to activate. Never describe mock-backed tests as a live login verification.

No IQ calculator or validated age/grade/peer comparison exists. Feedback thresholds and grade mappings are product design choices. No cross-device learning sync. No verified age/consent mechanism. Local history is not encrypted.

## Verification recorded

- 24 automated tests pass locally (Classic, Kids, auth adapter).
- Auth SDK build succeeds; npm reported zero known vulnerabilities at install time.
- Kids live mobile check-in completed: 20 answers, memory removal verified, correct result aggregation and saved feedback.
- History survived reload and switching learner slots did not mix records.
- Grade 10 memory display fits the mobile viewport. Post-auth mobile smoke tests pass: guest return, number practice/feedback, and unsaved-session confirmation before account navigation. The account-unconfigured state is explicit.
- GitHub CI passed for code commit `18a8d76f3cf6786abdad7961619ec297653a9312`: https://github.com/sumankaranam/reasonlab/actions/runs/43637893517
- Real Google consent/email delivery remains untested until provider setup.

- Discovery mobile browser checks pass at 390px and 320px: complete interest/preference flows, back/edit, navigation guards, reload persistence, learner separation, search/filter, reports and family exports.
- Additional browser checks pass: all-skipped/no-profile state, deletion, blocked storage, Kids-to-Discovery exit guard, print expansion/restoration and PDF generation. Mobile screenshots inspected.
- GitHub CI passed for Discovery feature checkpoint `c3099da9730cffca267657c4652003c8b628d466`: https://github.com/sumankaranam/reasonlab/actions/runs/43682768019
- Fixed a 320px overflow in the public email setup guide and ensured closed details expand for printing.

## Deployment

Current recorded Cloudflare version: `6e683736-e11f-4129-8ded-215b11c98e64`.
Hosting is static assets, Worker name `reasonlab`; no new paid resources created.
The GitHub repository was initially empty. Initial code checkpoint: `18a8d76f3cf6786abdad7961619ec297653a9312` (verify current main before work).

## Next actions

1. Owner creates/configures Supabase, SMTP and Google OAuth; supply only public URL/publishable key to the app.
2. Activate provider flags, deploy, test actual email/Google login with authorised adult test accounts.
3. If requested, separately design cloud progress sync and consent/data-deletion controls.

## Commands

```sh
npm ci
npm test
npm run build:auth
npm run dev
npm run deploy
```

Use existing Cloudflare authentication or the normal Wrangler login. Do not copy machine-local auth files into the repository. Read `docs/ARCHITECTURE.md` before changing scoring, identity or memory timing.
