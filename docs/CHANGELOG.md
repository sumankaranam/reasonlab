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
