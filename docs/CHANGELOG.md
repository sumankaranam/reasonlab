# Development milestones

Dates use Asia/Kolkata. Update this log at tested feature/fix checkpoints, alongside current `STATUS.md`.

## 2026-11-15 — Repository and adult authentication integration

- Initialized the user's empty GitHub repository and added the complete Kids/Classic source, tests, deployment config and SDK build.
- Added optional Supabase Google/email OTP account flows and isolated local account history.
- Kept production auth disabled pending owner-managed project/provider setup; added activation guide.
- Added CI for tests and SDK reproducibility. Local validation: 18 tests pass, SDK builds. GitHub CI passed for the code checkpoint.
- Verified mobile guest return, practice feedback, and session-exit guard after auth integration. Added no-store headers for Cloudflare's canonical `/account` path.
- Added root agent instructions, architecture/status docs and Cursor rule for safe periodic checkpoint commits/pushes and Markdown handoff updates.

## 2026-11-15 — Kids learning journey

- Added Grades 1–10, three stages, daily discovery, targeted practice and four-area check-ins.
- Added briefly displayed digit position recall and higher-level reverse recall.
- Added supportive feedback, minimum-evidence rules, exclusions, local learner slots and stage suggestions.
- Preserved original app/history as Classic. Tests passed for generators, scoring and evidence handling; live 20-item mobile flow and memory hiding verified.

## 2026-11-14 — Initial ReasonLab

- Built and deployed mobile-friendly number, visual and deductive reasoning exercises.
- Added practice/check-in modes, explanations, JSON export and local history.
- Explicitly reported exercise scores rather than inventing unvalidated IQ scores.

## 2026-11-15 — Discovery feature checkpoint

- Added original personality-preference and activity-interest questionnaires, balanced visible poles, skip-aware scoring and minimum-response rules.
- Added 24 career exploration families with projects, subject examples and reflection prompts, plus age-aware family guide and four-week plan.
- Added account/learner/grade-separated local reports, JSON/print exports, response review, deletion and unsaved-navigation guards.
- Linked Discovery from Kids and added a public email activation walkthrough. Owner elected to defer provider creation; no live email sign-in claim.
- Validation: 24 automated tests pass, including all 16 preference combinations and missing-data/identity isolation. Browser validation and deployment pending.

## 2026-11-15 — Discovery browser verification and deployment

- Deployed Discovery, career explorer, family guidance and owner email setup guide to the existing Cloudflare Worker. Final runtime version: `6e683736-e11f-4129-8ded-215b11c98e64`.
- Fixed narrow-screen wrapping of setup URLs and code tokens. Added before/after-print handling so collapsed guide sections print completely and return to their prior state.
- Verified live 18-question interest and 32-question preference flows, neutral/mixed scoring, back/review, saved history, learner separation, 24-family search/filter, JSON exports, family age bands and 320/390px layouts.
- Verified all-skipped questionnaires do not produce profiles, local deletion, blocked-storage recovery, and Kids exit confirmation when navigating to Discovery. Print expansion and generated PDF checked functionally; no claim of formal accessibility certification.
- All 24 automated tests pass. Feature CI succeeded. Real email/Google activation remains explicitly deferred by owner; exact steps are in `AUTH-SETUP.md` and live `/signin-setup`.

## 2026-11-15 — Supabase project connection checkpoint

- Read the owner-created ReasonLab project in the signed-in dashboard and configured only its public URL/publishable key. No secret key was read or stored.
- Verified HTTP 200 from the public Auth settings endpoint: email/signups enabled, Google disabled. This is connection verification, not email-delivery verification.
- Kept app provider flags disabled while the sender domain, SMTP service, code template and redirects are pending. Added an explicit connected-but-pending account screen.
- Owner requested help choosing a sender; documented Resend configuration and the outstanding domain choice.

## 2026-11-15 — Resume Google-first setup and efficient model workflow

- Confirmed the owner wants Google sign-in first, with no domain purchase. Created dedicated Google Cloud project `reasonlab`; OAuth onboarding remains in progress.
- Added technical handoff and persistent preference for stronger-model planning/review with lighter-model bounded tasks. A GPT-6 Luna subagent handled documentation; primary review corrected unsupported claims and push instructions.
- Checkpoint includes previously verified public Supabase configuration and connected/pending UI deployed as `395ae257-72d1-49ab-ba22-81cf23b7272a`. All 24 tests and live account/guest smoke passed for that runtime. No new runtime edits in this resume checkpoint.

## 2026-11-16 — Google Auth app registration checkpoint

- Successfully created the Google Auth app registration in project `reasonlab` with External / Testing audience.
- Prepared the Web OAuth client form with origin `https://reasonlab.simstart.workers.dev` and callback `https://krbuoncrksahcrnufprg.supabase.co/auth/v1/callback`; the OAuth client itself is not yet created and awaits action-time permission.
- Public app provider flags remain false. No code or runtime deployment changed; last recorded deployment is `395ae257-72d1-49ab-ba22-81cf23b7272a`. Google consent/account smoke remains pending.

## 2026-11-16 — Google OAuth client created

- Created the approved Web OAuth client in Google Cloud project `reasonlab` with the production origin and exact Supabase callback. Observed the successful creation dialog.
- Kept client credentials out of repository files and app configuration.
- Verified Supabase dashboard still reports Google DISABLED. Provider configuration and redirect settings require owner action under the Windows automation security-settings restriction.
- Updated status, architecture and technical handoff; both app flags remain false. Documentation-only checkpoint: no runtime changes, new deployment or live Google-login claim.

## 2026-11-16 — French learning and public setup cleanup

- Added a separate original French course: six stages, 36 lessons, 257 vocabulary entries, 216 authored tasks, 12 guided conversations, six bilingual stories, eight reference sections and ten sound tips.
- Added reading/listening/writing practice, sentence building, daily mixes, due review, checkpoints, phrase search, family reports and per-learner local progress. First answers remain the score after retries; helped listening is not independent listening evidence.
- Added French-only browser voice playback, temporary local 15-second recording/replay, and separately gated browser recognition with explicit provider-processing disclosure. No paid API, voice retention or server upload by the app.
- Removed the public owner activation link and setup walkthrough on request; retained project-only setup docs. Added an explicit missing-page response. Sign-in remains disabled.
- Fixed the Windows local-preview root route while preserving path-boundary checks.
- Validation: 46 unit tests pass; local mobile browser and edge checks pass. Voice hardware is simulated in checks. Deployed to Cloudflare version `c3aac00a-7a21-4df1-9adb-fef255e5fefe`; both deployed browser suites passed. Runtime commit `782be4214ca57dab880b88e0f41ca15590c23a5c` passed GitHub CI.

## 2026-11-16 — French conversation path, visual cards and resume

- Replaced the flat French home with six guided chapters, 36 ordered lessons, explicit next steps, a saved weekly rhythm and a conversation passport.
- Added original bright SVG pictures (25 topics plus number/color cards and all lesson scenes), flip-style memory cards, model conversations and six additional guided missions.
- Added automatic same-device checkpoints for lessons, cards, daily practice, stories, conversations and checkpoints. Restores typed/token/first-response/retry/help state; preserves legacy completed progress and account/learner isolation. Partial answers are omitted from exports; no audio is stored.
- Added distinct achievements with explicit lesson and mission criteria; no duplicate retry rewards or all-skip mastery. Returning users see resume promptly.
- 62 tests and all three browser suites pass locally and on the deployed site. Sign-in providers and cross-device sync remain unactivated; identity tests use a mock adapter. Deployed Cloudflare version `8f991798-c434-49c4-80fa-2553e27c6ba1`, runtime commit `4a94cc80c4f461acf8f298312c12b75ec9ee7950`; GitHub CI passed.

## 2026-11-16 — Enable configured Google sign-in

- Owner completed Google provider setup; public Supabase settings confirm Google enabled and signups allowed. Enabled Google only in the shared adult account configuration, including French; email stays disabled.
- No credentials or storage changes. Real consent/callback and signed-in account verification remain pending.

Activation release: Cloudflare `cf0fcba0-d9cd-4ad9-a2a8-0744f2b7aaac`. All 62 tests and auth SDK build pass; vendor bundle unchanged. Live mobile smoke passed Google button/adult gate, disabled email, real redirect to Google, cancellation error UI and French guest navigation. Actual Google consent/callback and signed-in identity remain user-verification steps.

## 2026-11-16 — Child nicknames, avatars and sign-out

- Added optional post-login profile setup with ten original colorful avatars and three named learner slots. No child email/photo required.
- Shared top banner on Kids, French and Discovery shows selected child, profile editing and guarded sign-out. Existing learner progress is preserved; settings and names remain local to the adult account on this browser.
- 65 unit tests and local mocked-auth mobile onboarding/profile/guard checks pass.

- Released as Cloudflare `1c9d7aba-1b25-4373-857f-b1d677d3550e`; deployed mobile profile checks pass. Auth remains mocked in profile QA; no real Google consent claimed.

## 2026-11-16 — Illustrated learner themes

- Added Classic Garden, Unicorn Rainbow, Racing Cars, Fairy-tale Castle, Space Explorers and Ocean Friends with original SVG scene artwork and coordinated UI colors.
- Theme selector available to guests and adults; choices persist separately by learner/account across Kids, French, Discovery and Account. Profile editor includes a theme choice. Activity state and semantic answer colors are preserved.
- 68 unit tests and local theme/profile browser suites pass, including mobile layouts, storage failures and account/learner separation.

- Deployed Cloudflare version `e935bf71-5c97-4c90-8faf-dc2a92a4974c`; live theme browser suite passed.

## 2026-11-16 — Global themes and language selection

- Replaced per-learner themes with one browser-wide website theme; extended to Classic and the missing-page screen, plus broader controls/cards/dialog styling.
- Added a language-to-learn selector everywhere: French available, Spanish/German/Hindi/Japanese marked Coming soon. French navigation respects unfinished-activity guards. No interface translation or additional curriculum added.
- 69 unit tests and local all-page theme/mobile/navigation checks pass. Child learning history remains scoped and unchanged.

- Cloudflare release `0be0321c-c29d-465b-b742-08be6c6dd78b`; deployed all-page theme/navigation suite passes.

## 2026-11-16 — Theme text contrast and launch planning

- Fixed Daily Discovery pale-on-pale text inherited from the original dark featured card. Darkened secondary text and planning captions across themes.
- Added rendered contrast regression for six themes across six page surfaces. Local check passes with documented exclusions.
- Added `LAUNCH-AND-MONETIZATION.md` with beta launch, parent-paid options, advertising constraints and scaling guidance. No ads, tracking or billing added.

- Cloudflare deployment `d5407829-9de8-407c-9c0a-8b53b33cfc38`; deployed contrast suite passes across all six themes and six main page surfaces.

## 2026-11-16 — Aggregate visits and scheduled owner reports

- Added first-party aggregate page views and estimated tab visits, no individual visitor/child records, browser opt-out/GPC/DNT and a public explanation.
- Created aggregate D1 storage with 90-day retention and configured 9 AM India-time scheduled owner email. Prepared server-only registration-count RPC and Resend integration with deduplication and missing-data labels.
- Owner deferred sender setup. No actual report emailed or Supabase registration query executed. Setup instructions retained in non-public docs. 77 tests, local privacy/collection browser checks and Worker dry-run pass.

- Deployed `bce0e87c-abb1-421a-8d83-51b0e055171f` with daily cloud trigger. Live browser privacy checks and actual aggregate write/read-rejection/404 smoke pass; D1 contains the one QA event. No email sent; sender and registration setup deferred.

## 2026-11-16 — Welcome page and three-path activity hub

- Added adult sign-in/guest welcome, returning-user hub and language availability picker. Reasoning moved to `/kids.html` with unchanged learner/history keys.
- Added guarded Activity hub navigation across learning sections; preserved French resume and Discovery age restrictions. Theme controls follow primary navigation content on the hub.
- Added separate hub aggregate counter/view without rewriting prior reasoning counts. Daily reporting remains pending sender/Supabase setup.
- Local unit and mobile/contrast/navigation/privacy regression checks pass; authenticated browser flows use mocks.

- Released as Cloudflare `8470712f-05df-4248-adf8-4f371368bb24`. All 78 automated tests pass; live landing and expanded all-theme contrast suites pass.

## 2026-11-16 — Tamil and Kannada adventures

- Added two beginner courses with 12 lessons each, native script, roman reading aids, picture cards, meaning checks and short dialogues.
- Shared language picker and hub now offer French, Tamil and Kannada; other planned languages retain Coming soon labels.
- New course progress stays separate by language, adult/guest and learner slot. Device voice support is optional and clearly disclosed.
- Added non-destructive language usage aggregation; daily email sender configuration remains pending.

- Verified 83 automated tests, local mobile course flows, shared landing/theme navigation and six-theme contrast checks. Auth identities and unavailable voice behavior mocked. Remote aggregate migration applied.

- Released as Cloudflare `68994e5e-ccc4-4b8e-808e-3cf192c54ccc`. Live Tamil/Kannada mobile and landing/navigation suites pass; account identities and missing speech voices are mocked. Production voice availability remains device-dependent.
- Deployed six-theme solid-background contrast regression suite also passes, including both new courses.

## 2026-11-17 — Reasoning Adventures engine checkpoint

- Added deterministic original templates for patterns, logic, visual reasoning and memory, with three difficulty levels and explanations.
- Added bounded summary validation, isolated storage keys, independent weekly evidence, practice suggestions and completion badges.
- Nine engine tests pass, including independent answer checks across many seeds and rejection of assisted/interrupted/repeated evidence. UI integration/browser validation is in progress.

## 2026-11-17 — Illustrated Reasoning Adventures

- Added four illustrated worlds, worked-example lessons, daily quests, weekly check-ins and focused practice at three difficulty levels.
- Added a browser-local learner dashboard with evidence thresholds, first-attempt weekly protection, level suggestions, earned badges and parent activities.
- Preserved active puzzles during same-account authentication refresh; account changes discard active work and reload the correct local history. Memory stimuli are hidden before answering; interruptions cannot supply independent evidence.
- Integrated the hub and legacy grade practice links; adventures share existing reasoning aggregate counters. Updated architecture and handoff documentation.
- 92 automated tests and dedicated mobile, landing/navigation and expanded six-theme contrast checks pass. Browser account identities and clock are mocked.

- Deployed Reasoning Adventures as Cloudflare `12aad834-0370-4243-8113-0d071b595031`. Live 320px adventure, landing/navigation and expanded six-theme contrast suites pass. The first adventure run timed out waiting for initial rendering; a diagnostic rerun passed without page errors. The initial timeout cause was not established. Auth and clock remain mocked for the dedicated browser suite.

## 2026-11-17 — Daily learning home, vocabulary review and cloud saving

- Added My Learning Today with per-learner next steps, course continuation, review links, reasoning badges and a growing learning garden.
- Added five-word French/Tamil/Kannada reviews with due-first scheduling, trusted visuals and matching-language voice fallback.
- Added opt-in adult cloud saves with verified server identity, account-scoped allowlisted snapshots, revision conflicts, explicit restore/replace and deletion tombstones. No new secret credentials needed; personality/Classic/guest/unfinished work excluded.
- Updated account/profile ordering, privacy explanations, architecture and handoff docs. Applied additive D1 migration 0004.
- 106 automated tests and local browser/contrast checks pass; authenticated two-device tests use mocked auth/transport. Real-account production acceptance remains unverified.

## 2026-11-18 — Daily home/cloud release verification

Released as Cloudflare `5f3f34ec-ea06-4ec6-8ac4-b9fdc8eb385c`. Live Today, vocabulary review, cloud-control and expanded contrast suites pass (authenticated cloud transport is mocked in browser checks). Actual production API probes return 401 without credentials, 401 for an invalid token, and 403 for cross-origin requests. No authenticated real-account save/restore has been performed.

Live testing found Workers does not support server fetch redirect mode `error`; switched to `manual`, which rejects redirects without forwarding credentials. Temporary diagnostics removed. Updated the Today browser URL assertion for Cloudflare's extensionless canonical redirects. All seven cloud tests pass after the runtime fix; total suite previously passed 106 tests.
