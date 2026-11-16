# Architecture and design

Updated: 2026-11-16 (Asia/Kolkata). Start with `STATUS.md` for current activation state.

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
| `public/auth-config.js` | Public project URL/key and provider-enabled flags; Google enabled after public provider-settings verification; email sender setup deferred |
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

`discover.html`, `discovery.js`, `discovery-engine.js`, `discovery-data.js` and `discovery.css` implement separate original interest/preference questionnaires, career exploration and family guidance. See `DISCOVERY-DESIGN.md` for scoring, module ownership, storage and safeguards. Owner setup instructions are in `docs/AUTH-SETUP.md` and `docs/TECHNICAL-HANDOFF.md` only; the former public setup page was removed at the owner's request.

## Authentication activation handoff

Google sign-in is the first activation target. Supabase project `krbuoncrksahcrnufprg` is connected with public configuration, and Google Cloud project `reasonlab` is created. Google provider is verified enabled and the app Google flag is true; email remains disabled. Real consent/callback verification is pending. Read `TECHNICAL-HANDOFF.md` for the exact URLs and remaining steps.

## Google activation boundary (2026-11-16)

The dedicated Google Cloud project `reasonlab` now has an External / Testing registration and a Web OAuth client. Its server callback terminates at Supabase, which holds the Google client secret; the static app receives no provider secret. The owner reported completing provider setup, and the public Supabase settings endpoint now confirms Google enabled. The app enables Google only. Real user consent and callback remain to be verified; provider credentials remain confined to dashboards.

## French learning extension

`french.html`, `french.js` and `french.css` own the responsive course, lesson/quiz state, role plays, stories, searchable phrasebook, reference shelf, voice studio and family reports. `french-data.js` owns original curriculum with stable IDs. `french-engine.js` owns scoring, content generation, validation and review scheduling; `french-audio.js` owns browser audio lifecycles. See `FRENCH-DESIGN.md`.

French keys use `reasonlab-french[:verified-user-id]:learner-N`. French selection preferences use the existing settings key plus `:french`, with Kids settings only as an initial fallback. School grade is context, not a language placement. Completed mixed/text lessons update best stars and latest accuracy; listening-only sets, checkpoints, stories and conversations add activity evidence without claiming whole-lesson completion. Only the first response counts, helped answers are excluded from independent correct totals, and partial activities now auto-save as resumable checkpoints (see the journey extension below).

Review intervals are 1/3/7/14/30 days after successful due reviews (80% threshold). Early repeated success cannot advance the interval box; lower scores return to one day. The latest ten completed activities feed reading/listening/writing/conversation feedback; fewer than ten items in an area yields an exploration label. Thresholds are product choices, not calibrated language levels. History is capped at 100 summaries per learner.

Browser synthesis uses an available French voice only. Record/replay uses `getUserMedia` and `MediaRecorder`, temporary blob URLs and no network upload. Recognition is optional, separately explained/gated and may use the browser provider's server; transcripts are ephemeral. Generation tokens prevent late streams or callbacks from restarting a cancelled activity. All tracks stop on timeout, navigation and hidden tabs. `media-src 'self' blob:` allows temporary playback; French routes permit only same-origin microphone use and deny camera use. No API keys or backend resources added.

Cloudflare explicitly serves a `404.html` for missing assets, including both old setup-page paths. The local preview server's root-path check was fixed to allow `/` on Windows while preserving path traversal rejection.

## French journey, pictures and resuming (2026-11-16)

`french-journey.js` defines six ordered chapters, six new conversation missions, a learner-selected weekly rhythm, checkpoint validation and derived achievements. `french-learning-ui.js` renders the journey, lesson pictures, flashcard deck and passport; `french-journey.css` adds its visual treatment. `french-pictures.js` supplies original accessible SVG illustrations: 25 picture topics, quantity/color cards and scenes for all 36 lessons. Abstract phrases use explicitly labeled scenes, not misleading exact illustrations.

`french-activities.js` reconstructs every activity from trusted course content and a saved kind/id/seed descriptor. Drafts contain bounded answer strings, first responses, retry feedback, question index, token indices, typed input and help state; they never contain task HTML or audio. Content versions reject incompatible old drafts. Daily review stores its chosen lesson IDs so later progress cannot change a resumed question set.

The existing French storage object atomically contains `journey` alongside its legacy lesson/history fields; old progress without this nested property migrates to an empty journey. One current checkpoint, plan, mission results and flashcard reflections are scoped to the existing verified-account/guest + anonymous learner key. Save after interactions, typing, pause, visibility loss and page exit. Completing an activity clears its checkpoint in the same write as its result. Starting another activity asks before replacing an unfinished checkpoint. A failed storage write is announced and unload protection remains when progress is memory-only. Guest data is not silently imported into an adult account. This remains same-device storage, with no cloud-sync or live-login claim.

Lesson goals require at least 70% first-answer accuracy without credit for helped answers. A chapter stamp requires all six lesson goals and its own mission at 70%+, every turn answered, without help. Six independent chapter stamps unlock the final passport. Achievements derive from best stored evidence and do not multiply on retries or vanish after a weaker attempt. Picture-card reflection earns a review achievement, not a language-ability score. Existing reasoning/Discovery state is untouched.

## Child names and avatars (2026-11-16)

`child-profiles.js` owns ten original fixed SVG portraits, validation and account-scoped nickname/avatar storage. `child-profile-ui.js` renders adult-account onboarding/editor and the shared top banner on Kids, French and Discovery. `child-profiles.css` provides responsive radio choices and banner styles. Three existing learner slots remain the stable progress identity; changing a nickname/avatar never changes result keys. Names are trimmed to 1–30 characters and HTML-escaped. Any avatar is available to any learner; no gender, photo, birth date or child email is collected.

Profile metadata uses `reasonlab-kids-settings:<verified-user-id>:children`; guests do not receive account profiles. Saving selects that slot in Kids/Discovery and French settings while preserving grade/stage. Profile details stay in localStorage, outside Supabase and learning exports; no encryption or cloud sync. First-login setup is shown above the account card when no saved profiles exist. Setup is optional and shown again on a new device. Top-banner sign-out calls the existing navigation guard before Supabase local sign-out. French checkpoints save before leaving; Kids/Discovery retain their existing discard confirmation.

Tests: `tests/child-profiles.test.mjs` covers validation, account isolation, preservation and storage failure; `tests/browser/child-profiles.mjs` covers mocked authenticated onboarding, ten choices, escaped names, reload, page banners, learner/account switching, 320px layout, French sign-out guard and guest cleanup. No real Google identity is used by this test.

## Website-wide themes and language entry (2026-11-16)

`themes.js` owns six allowlisted original SVG themes and a shared theme/language dock. `themes.css` styles page backgrounds, buttons, cards, banners, learning controls, dialogs and navigation while retaining semantic answer colors and vocabulary illustrations. The theme is stored in `reasonlab-theme` for this browser, shared across all learners and adult/guest contexts. No identity or learner data is stored in that preference. An old scoped theme migrates when encountered if no global choice exists; global choice takes precedence. Unknown values fall back to Classic; failed saves show a preview-only message.

Kids, French, Discovery and Account mount the dock through `child-profile-ui.js`. Classic mounts through its own guarded renderer. `theme-fallback.js` mounts it on the 404 page. Child profile editing no longer contains a per-child theme field. Theme switching leaves active questions/checkpoints intact. Classic history remains separate and unchanged.

The language-to-learn selector offers French and visibly disabled Coming soon entries for Spanish, German, Hindi and Japanese. The Learn French button uses each learning page's existing unfinished-session navigation guard. This is a course selector, not interface translation; instructions remain English. No other language curriculum or release dates are promised.

69 unit tests pass. `tests/browser/themes.mjs` covers all six page surfaces, global continuity across identity/learner changes, course availability labels, French navigation, guarded Classic exit, activity preservation, 320px layouts and failed storage. Auth identity is mocked. Local missing routes are plain text, so QA opens `/404.html`; deployed Cloudflare serves that document for missing routes.

## Contrast regression coverage

Pastel featured cards explicitly reset the original dark-card white heading/body text. Shared muted text, eyebrow labels, footer copy, hero captions and French plan captions use darker colors. `tests/browser/theme-contrast.mjs` measures visible rendered text against opaque ancestor backgrounds on six page surfaces × six themes, using 4.5:1 normal and 3:1 large-text thresholds. It excludes gradients/transparency, SVG and native select rendering; this is a targeted regression test, not a full accessibility certification. Saves findings and a Daily Discovery screenshot in ignored `work/`.
