# Architecture and design

Updated: 2026-11-15 (Asia/Kolkata). Start with `STATUS.md` for current activation state.

## Runtime

Buildless HTML/CSS/ES modules served by Cloudflare Workers Static Assets. No custom Worker handler, application API, database, LLM calls or analytics. The one bundled dependency is the official Supabase JS client, generated with esbuild for optional adult authentication.

| File | Responsibility |
| --- | --- |
| `public/index.html` | Kids shell and navigation; loads `kids.js` |
| `public/kids.js` | Kids UI, session state machine, memory timing, history, reports |
| `public/kids-engine.js` | Pure grade/stage generators, scoring, evidence and progression |
| `public/classic.html`, `public/app.js`, `public/engine.js` | Original general-purpose app and isolated history |
| `public/style.css` | Shared responsive green/cream design system |
| `public/account.html`, `public/account.js` | Adult sign-in/account screens |
| `public/auth-core.js` | Pure config validation, progress keys, injected auth-service adapter |
| `public/auth-client.js` | Conditional SDK loading, PKCE client, verified current user |
| `public/auth-config.js` | Public project URL/key and provider-enabled flags; currently empty |
| `public/vendor/` | Reproducible official SDK bundle and licence |
| `public/_headers` | CSP, referrer and MIME policies; no-store account page |
| `scripts/configure-auth.mjs` | Validate and write public auth configuration |
| `scripts/build-auth.mjs` | Rebuild SDK bundle; never hand-edit vendor output |
| `server.mjs` | Local static preview at 127.0.0.1:5188 |
| `wrangler.jsonc` | Existing `reasonlab` Worker, assets from `public/` |

## Session and scoring flow

Choose anonymous learner slot (1–3), grade (1–10), and stage (1–3). Daily sets are seeded by browser-local date plus learner/grade/stage. Check-ins and practice use cryptographic random seeds as input to deterministic generators. Questions are unique within a session; templates and questions can recur between sessions.

Modes: daily = 12 mixed questions, check-in = 20 mixed (5/domain), practice = 8/12/20 with optional area filter. Areas: numbers, visual repeating groups, logic and memory. Grade/stage parameters increase construction complexity; they are not validated curriculum/age norms.

Memory state: `ready → showing → hidden`. A readiness click starts a wall-clock timeout. Digits are removed from the rendered DOM before options appear. Back/next are disabled during display. Hidden-tab interruption or leaving during display marks assistance/interruption. Practice can generate a new number; check-ins cannot replay. Full browser suspension can still affect timing; no scientific timing precision is claimed.

Scoring counts exact keyed answers, with skips counted incorrect. Learning-map evidence filters by version, learner, grade, stage, complete check-in, no assistance/interruption, and unique seed; then selects the latest five. Per-domain categories require two check-ins and ten questions. Thresholds are explicit product rules (80% / 50%), not normative or validated cutoffs. Stage suggestions require all four areas strong at preceding stages; levels remain selectable.

## Storage and identity

Guest keys: `reasonlab-kids-history`, `reasonlab-kids-settings`.
Authenticated keys append `:<Supabase user UUID>`. Supabase `getUser()` verifies identity before that history loads. Classic retains `reasonlab-history` independently. Authentication changes clear active in-memory sessions and reload the appropriate local store. Guest records are never silently imported into an adult account.

Up to 150 kids summaries per account/guest store; each summary includes version, profile, grade, stage, seed, mode, date, elapsed seconds, totals, assistance and domain totals. Raw answers and memory stimuli remain in memory unless exported. Last report adds recommendations and learning-map evidence. No cross-device sync exists.

Supabase tokens use sessionStorage under `reasonlab-auth-v1`. A tab-local session supports same-tab PKCE return. Google requests `openid email profile` only. Email uses `signInWithOtp` followed by `verifyOtp(type: email)`. Provider-side rate limits enforce request throttling; the UI resend delay is only a convenience. No passwords are handled.

Local history is not encrypted and is accessible to someone with browser/device access. Account key separation is not a server security boundary. Future cloud sync requires real access policies, consent and deletion controls, and integration tests.

## Important design decisions

- Maintain the existing visual identity and guest access rather than require children to register.
- Use generated original exercises; no restricted clinical test items.
- Use supportive practice feedback; no IQ conversion or fixed logical/memory identity label.
- Do not use grade as a substitute for age norms.
- Integrate a managed auth provider rather than implement credential storage or OAuth token verification ourselves.
- Keep Google/SMTP secrets entirely in Supabase. Only publishable client configuration belongs in the site.
- Keep hosting and GitHub source aligned; GitHub CI checks code but does not automatically deploy.

## Verification and extension points

`tests/engine.test.mjs`: Classic generators, exhaustive logic entailment, scoring.
`tests/kids.test.mjs`: all grade/stage/area/length combinations, solutions, exclusions, progression.
`tests/auth.test.mjs`: mock-backed auth adapter, key/URL validation and local isolation.
CI: Node 22, locked install, tests, SDK build, generated-bundle diff check.

UI files are currently large imperative modules. Before major new features, consider extracting state/storage and view renderers into small modules while preserving tested flows. Add cloud storage only with explicitly designed ownership and migration. A credible IQ assessment remains a separate licensed/validated measurement project.

## Discovery extension

`discover.html`, `discovery.js`, `discovery-engine.js`, `discovery-data.js` and `discovery.css` implement separate original interest/preference questionnaires, career exploration and family guidance. See `DISCOVERY-DESIGN.md` for scoring, module ownership, storage and safeguards. `signin-setup.html` exposes the owner activation guide from the unconfigured account screen.
