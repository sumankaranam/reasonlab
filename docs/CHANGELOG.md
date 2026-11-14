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
