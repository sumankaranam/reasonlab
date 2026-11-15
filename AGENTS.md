# Agent handoff and working rules

Applies to the entire ReasonLab repository. Read this file first in every session.

## Start here

1. Read `docs/STATUS.md` for current implementation, blockers and verification.
2. Read `docs/ARCHITECTURE.md` for file ownership, data flows and design decisions.
3. Read `docs/CHANGELOG.md` for recent milestones and `docs/AUTH-SETUP.md` for login setup.
4. Inspect the current Git branch, status and remote head before changing anything.

## Planning, review and task sizing

- Use a stronger model for repository-level planning, architecture decisions and final review; use a lighter model for clearly bounded implementation or testing tasks when suitable.
- Avoid unnecessary agents, full-history context and repeated checks. Delegate only when work is meaningfully separable and the benefit justifies the overhead.
- Model choice is a workflow preference; actual billing savings have not been measured or verified.

## User-requested checkpoint workflow

- Make small, coherent commits at working milestones, and push them periodically during active work.
- A checkpoint means a completed fix/feature or tested subpart, not an arbitrary timer or every edit.
- Before each push: inspect the diff, run relevant checks, scan staged paths for secrets/runtime data, and update affected Markdown notes.
- Never commit credentials, local auth state, `.env`, `.dev.vars`, user records, downloads, `node_modules`, or deployment logs.
- Use normal fast-forward pushes. Never force-push, rewrite shared history, or discard unrelated work.
- If remote changes exist, fetch and reconcile them; preserve other contributors' changes.
- Default new multi-step work to a descriptive branch when concurrent work or review is expected. Follow explicit user instructions about main/PRs.
- Record an honest incomplete checkpoint when blocked; do not claim tests, deployment or login work that were not verified.
- Do not create scheduled automations for Git pushes. Checkpoints happen while working on the task.
- Deploy coherent, tested milestones periodically to the existing Cloudflare Worker, as requested by the owner. Verify the live affected flows, record the deployment version and keep Git/docs aligned. Do not deploy incomplete changes merely because time has passed.

## Documentation with code

- Update `docs/STATUS.md` when capability, verification, deployment or blockers change.
- Update `docs/ARCHITECTURE.md` when modules, storage, dependencies or design decisions change.
- Append a dated milestone to `docs/CHANGELOG.md` with concrete changes and validation.
- Keep `README.md` as a short entry point. Keep secrets and conversation transcripts out of docs.
- At handoff, list what works, what is incomplete, exact next steps and relevant commands.

## Product constraints

- Preserve guest practice, mobile usability and Classic unless the user requests otherwise.
- Never turn uncalibrated exercise accuracy into IQ, peer rankings, diagnoses or fixed intelligence/learning-style labels.
- Keep child profiles anonymous; adults own optional authentication accounts.
- Practice and assisted/incomplete/interrupted sessions must not enter independent check-in feedback.
- Treat account-local storage as convenience isolation, not encrypted or server-authorised storage.

## Checks

Use Node 22+. Run `npm ci`, `npm test`, and `npm run build:auth` as relevant. Review generated vendor changes, do not hand-edit the bundle. Check mobile flows for UI changes. Live provider checks require real configured services; mocks do not establish email/Google login success.
