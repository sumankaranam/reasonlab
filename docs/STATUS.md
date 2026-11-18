# Current status and handoff

Updated: 2026-11-16 (Asia/Kolkata).

## Entry points

- Repository: https://github.com/sumankaranam/reasonlab
- Live welcome/activity hub: https://reasonlab.simstart.workers.dev/
- Reasoning/Kids: https://reasonlab.simstart.workers.dev/kids.html
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

Current recorded Cloudflare version: `8470712f-05df-4248-adf8-4f371368bb24` (welcome page, activity hub and language picker). Runtime matches the landing-page checkpoint in Git. Previous French runtime: `4a94cc80c4f461acf8f298312c12b75ec9ee7950`.
Validation: all 62 tests and reproducible auth build pass. Live mobile smoke confirms enabled Google button, adult gate, disabled email, actual Supabase redirect to accounts.google.com, cancellation-error display and French guest navigation. No consent or actual login was completed.
Hosting: Worker `reasonlab`, asset-first static pages plus `/api/usage`, D1 `reasonlab-usage`, and daily cron. Worker/D1 service quotas apply; no plan upgrade or payment was performed.
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

## Daily owner report preparation

Aggregate visit/page-view collection, privacy opt-out and a cloud-scheduled previous-day report at 9 AM India time are implemented. D1 schema created remotely. The owner deferred Resend setup: no sender secret, no live emails. Supabase aggregate SQL and private key setup also remain pending, so new adult-registration totals are unavailable. 77 automated tests plus local browser collection/privacy checks pass; Worker dry-run succeeds. See `DAILY-REPORT-SETUP.md`. Deployed `bce0e87c-abb1-421a-8d83-51b0e055171f` with 03:30 UTC cron. Live privacy suite passed; actual write returned 204, read rejected 405, 404 routing preserved, and D1 verified one QA aggregate event. No real email/Supabase count verification yet.

## Welcome and activity navigation

Root is now a welcome screen with Adult sign in / Explore as a guest. Returning guests in the same tab and verified adults see a three-path hub. Language learning has a French/Coming soon picker; reasoning has its own `/kids.html` route; Discovery preserves the 16+ personality gate. Activity hub links respect unfinished-session guards. Existing storage/profile data unchanged. Aggregate hub counts are separated with a non-destructive D1 migration. 78 automated tests and local landing, contrast, French mobile/edge, profiles, themes and usage suites pass. Screenshots reviewed at 320/390px. Deployed `8470712f-05df-4248-adf8-4f371368bb24`; live landing and all-theme contrast suites pass. Provider identities are mocked in authenticated browser tests.

## Tamil and Kannada courses

Added 12 beginner lessons per language, in three stages: picture-symbol cards, native script/roman reading aids, ten separate number cards, first-answer meaning quizzes, stage badges, short dialogues, and saved activity checkpoints. Hub and global picker offer all three live courses. Existing adult login/profile slots and themes are reused; progress remains browser-local and separate per course/account/slot. Voice playback requires a matching device voice; no microphone/recognition for these new courses.

83 automated tests pass. Local mobile Indic flow tests cover score/first-answer persistence, badges, pause/replacement/resume, no-voice fallback and mocked account/slot isolation; shared landing/themes/contrast checks pass. Screenshot reviewed at 320px. Remote additive language counter migration applied; existing data preserved. Deployment verification follows in the release note. Native educator review and real-device voice testing remain follow-up work.

- Released as Cloudflare `68994e5e-ccc4-4b8e-808e-3cf192c54ccc`. Live Tamil/Kannada mobile and landing/navigation suites pass; account identities and missing speech voices are mocked. Production voice availability remains device-dependent.
- Deployed six-theme solid-background contrast regression suite also passes, including both new courses.

## Reasoning Adventures — 2026-11-17 checkpoint

The new pure engine provides four areas, three levels, daily/weekly/focused sets, validated local summaries, first-attempt weekly evidence, suggestions and badges. Nine new engine tests pass (92 total), including independent solution checks across 80 seeds, all levels and all modes/areas. UI is implemented and under browser verification; not yet deployed. See `REASONING-ADVENTURES.md`.

## Reasoning Adventures — completed local verification

Four illustrated worlds now provide worked examples, six-puzzle practice, daily five-puzzle quests and balanced twelve-puzzle weekly check-ins. Three levels use grade starting points and optional practice suggestions. First answers, hint use and interrupted memory trials remain distinct. The dashboard shows qualifying weekly evidence, supportive skill labels, badges and parent activities. Existing Kids/Classic histories and routes remain available.

All 92 automated tests pass. Dedicated 320px browser checks pass for first-answer locking, hints, memory display/tab/suspension/navigation interruptions, weekly repeats and two-week evidence, account/slot isolation, same-account token refresh, history clearing and blocked storage. Identity and clock are mocked in these tests. Shared landing/navigation checks pass; six-theme contrast checks include map, lesson, question, answer feedback and progress. Screenshots reviewed. Deployment verification will be recorded below.

- Deployed Reasoning Adventures as Cloudflare `12aad834-0370-4243-8113-0d071b595031`. Live 320px adventure, landing/navigation and expanded six-theme contrast suites pass. The first adventure run timed out waiting for initial rendering; a diagnostic rerun passed without page errors. The initial timeout cause was not established. Auth and clock remain mocked for the dedicated browser suite.

## My Learning Today, vocabulary review and cloud saving — 2026-11-17

Implemented personalized next steps, selected-learner course links and a learning garden based on retained completed activities. French/Tamil/Kannada vocabulary review offers up to five due/new words per day with self-ratings and spaced schedules. Optional parent-controlled cloud saves now include profiles and completed progress, with explicit restore/replace/delete controls; guest, Discovery/Classic, audio and unfinished answers stay local. Migration 0004 applied remotely without changing existing records.

106 automated tests pass (including real in-memory SQLite conditional-write checks). Local Today/review/profile and two-device cloud-account browser flows pass; cloud transport/auth and device voices are mocked where applicable. Six-theme contrast checks include the new home/review/privacy surfaces. 320px screenshots reviewed. Actual Google-authenticated production save/restore still needs a real-account acceptance check; public rejection checks and deployment details are recorded below when released.

## 2026-11-18 — Daily home/cloud release verification

Released as Cloudflare `5f3f34ec-ea06-4ec6-8ac4-b9fdc8eb385c`. Live Today, vocabulary review, cloud-control and expanded contrast suites pass (authenticated cloud transport is mocked in browser checks). Actual production API probes return 401 without credentials, 401 for an invalid token, and 403 for cross-origin requests. No authenticated real-account save/restore has been performed.

Live testing found Workers does not support server fetch redirect mode `error`; switched to `manual`, which rejects redirects without forwarding credentials. Temporary diagnostics removed. Updated the Today browser URL assertion for Cloudflare's extensionless canonical redirects. All seven cloud tests pass after the runtime fix; total suite previously passed 106 tests.
