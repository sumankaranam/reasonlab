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

Original 32-question MBTI-style reflection for self-declared ages 16+, 18/36 activity-interest questions by grade, transparent skip-aware scoring, local reports, 24 searchable career families and a detailed family guide. Career ordering uses interests only; practice feedback is separate. See `DISCOVERY-DESIGN.md`. Owner setup documentation is kept outside the deployed public directory.

## French learning milestone (live and verified)

`/french.html` adds six stages and 36 original lessons, 257 vocabulary entries (250 distinct phrase/meaning pairs), 216 authored tasks plus generated reading/listening questions, 12 guided conversations (48 turns), six bilingual stories, ten sound tips and eight reference sections. Mixed/text practice, listening, sentence building, constrained writing, daily practice, due review, stage checkpoints, phrase search, family reports and anonymous learner progress are implemented.

Speaker playback uses an available French device/browser voice. Local record/replay and separately gated browser recognition are optional. Microphone data is not retained in app progress; browser recognition may send speech to its provider. The course covers beginner through intermediate themes without claiming certification or guaranteed fluency. Google is enabled in app configuration; email remains disabled. Guest French learning works.

The public owner activation link and `signin-setup.html` have been removed. Owner steps remain in local `docs/AUTH-SETUP.md` and `docs/TECHNICAL-HANDOFF.md`, which are not deployed. Both old walkthrough URLs return HTTP 404 on the live site.

Validation: 46 automated tests pass; local and deployed browser checks pass at 390px and 320px for lesson/retry/skip, correct scoring, assisted-listening exclusion, writing/token building, review/checkpoint/role-play/story UI, saved-state isolation, phrase search, studio gates/denial, export/print/delete, blocked storage, exit guards and home navigation. Audio lifecycle is simulated; real hardware quality remains unverified. See `FRENCH-DESIGN.md` for architecture and reproduction.

## French guided journey upgrade (live and verified)

Added six ordered conversation chapters, 25 illustrated picture topics and scene art for every lesson, reversible flashcards, six new conversation missions, a flexible weekly plan, and a recommended next step. An active lesson/deck auto-saves its place, typed answer, token choices and first-answer/retry state. Returning learners see their resume control before the long course map. Ten derived achievements include six chapter stamps and a final passport; all-skip attempts cannot satisfy lesson/mission requirements.

Existing French progress migrates without losing results. Plans, checkpoints, cards and mission records share the existing account/guest + learner isolation. Same-device resume works without registration. Google provider activation is verified; real consent/callback verification, email activation and cloud sync remain incomplete; account isolation is tested with a mocked verified identity, not real provider login.

Validation: 62 automated tests pass. The new journey browser suite and adapted existing mobile/edge suites pass locally and on the deployed site, including picture cards, reload/resume, typed/token/first-answer preservation, learner/account separation, achievements, old progress, 320/390px layouts and storage-failure behavior. No new backend or paid API was added.

## Not active / blockers

**Google provider configuration is verified.** On 2026-11-16 the owner completed setup and the public Supabase settings endpoint returned HTTP 200 with Google enabled and signups enabled. The app now enables Google only; email remains disabled without SMTP. Google OAuth remains the existing External / Testing registration and Web client. Real user consent, callback, signed-in identity and sign-out verification are still pending. No provider secrets entered the repository.

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

Current recorded Cloudflare version: `d5407829-9de8-407c-9c0a-8b53b33cfc38` (all-theme text contrast corrections). Runtime matches the contrast checkpoint in Git. Previous French runtime: `4a94cc80c4f461acf8f298312c12b75ec9ee7950`.
Validation: all 62 tests and reproducible auth build pass. Live mobile smoke confirms enabled Google button, adult gate, disabled email, actual Supabase redirect to accounts.google.com, cancellation-error display and French guest navigation. No consent or actual login was completed.
Hosting is static assets, Worker name `reasonlab`; no new paid resources created.
The GitHub repository was initially empty. Initial code checkpoint: `18a8d76f3cf6786abdad7961619ec297653a9312` (verify current main before work).

## Next actions

1. Completed: deployed Google-enabled app and verified live UI and redirect to Google.
2. Owner: complete Google sign-in in the same tab, confirm account identity, visit French, then verify sign-out. Check Google audience/test-user settings if access is denied.
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

Current authentication checkpoint: Google provider verified enabled; app Google flag true, email flag false. Real consent/callback validation remains pending. See `docs/TECHNICAL-HANDOFF.md`.

## Child profile milestone

Adult account onboarding now offers a nickname and ten colorful original avatars (five girl and five boy designs, all selectable by anyone). Up to three existing learner slots can be named. Selected child appears above Kids, French and Discovery with edit profiles and sign-out controls. Same-device account separation only. 65 automated tests and local/deployed mobile profile suites pass; browser identity is mocked. Deployed as `1c9d7aba-1b25-4373-857f-b1d677d3550e`.

## Website-wide themes and language selector

Six original illustrated themes now use one device-wide preference across Kids, French, Discovery, Account, Classic and the 404 screen. Switching learners/accounts does not reset the theme. Profile setup no longer has a separate theme choice. A course selector shows French available now, with Spanish/German/Hindi/Japanese Coming soon; interface instructions remain English. 69 unit tests and local/deployed all-page theme/navigation checks pass. Deployment: `0be0321c-c29d-465b-b742-08be6c6dd78b`.

## Theme contrast and launch planning

Daily Discovery contrast fixed; shared captions and navigation text darkened. Local rendered solid-background text checks pass on six page surfaces across all six themes (not a full accessibility audit). See `LAUNCH-AND-MONETIZATION.md` for proposed beta/monetization steps; no advertising or payments are integrated. Deployed `d5407829-9de8-407c-9c0a-8b53b33cfc38`; live contrast suite passes.
