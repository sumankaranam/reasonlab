# ReasonLab

Mobile-friendly reasoning practice for Grades 1–10. Live: https://reasonlab.simstart.workers.dev

## Features

- Ten grade starting points, three stages each: Discover, Build and Stretch.
- Daily discovery (12 questions), skill check-ins (20), targeted practice (8/12/20).
- Number patterns, visual patterns, logical thinking and briefly displayed digit recall; higher levels include reverse recall.
- Explanations, downloadable feedback, three anonymous learner slots, learning map and stage suggestions.
- Optional adult Google sign-in and email one-time code integration through Supabase.
- Guest access; original app and its history remain at `/classic.html`.

## Authentication status

**Production sign-in is disabled until the owner connects a Supabase project and configures email/Google providers.** The public configuration is deliberately empty; there is no fake login. Follow [the activation guide](docs/AUTH-SETUP.md).

Google sign-in requests only basic identity scopes, never inbox access. Email codes support Gmail, Outlook, Yahoo and other receiving addresses once custom SMTP is configured.

## Run and test

Requires Node.js 22 or newer:

```sh
npm ci
npm test
npm run build:auth
npm run dev
```

Open http://127.0.0.1:5188. The official Supabase SDK is bundled and committed in `public/vendor/`. CI rebuilds it to verify reproducibility.

## Cloudflare deployment

```sh
npx wrangler login
npm run deploy
```

Only `public/` is uploaded to the `reasonlab` Worker. Never place secrets there. Supabase project URLs and publishable keys are public configuration; Google/SMTP/server secrets belong in the provider dashboard.

## Feedback and limitations

Session accuracy is correct answers divided by all questions; skips count as incorrect. The learning map uses up to five recent eligible check-ins at the same learner/grade/stage, requiring 10 questions per area across at least two sessions. Practice, helped, interrupted, incomplete and duplicate-seed sessions are excluded.

App-defined bands: 80%+ strong practice results, 50–79% developing, below 50% needs more practice. Stage suggestions require strong results across all four areas at preceding stages; every stage remains selectable.

These are original exercises, **not a validated IQ test**. Grades and difficulty are design starting points, not population norms or school-board alignment. No IQ estimate, peer percentile, fixed intelligence type or diagnosis is provided. Different question sets are not equated.

## Privacy and persistence

No child names, birth dates, school names or child accounts are requested. Optional adult authentication uses Supabase/Google. Adult confirmation is a declaration, not verified age or legal consent verification.

Auth tokens use the current tab's sessionStorage. Learning summaries use localStorage, separated by authenticated user ID or guest. Guest history is not automatically imported. Results do not sync across devices and are not uploaded to an application server. Local storage is not encrypted; login is not a security boundary against someone with browser/device access. Sign out on shared devices.

Up to 150 kids-session summaries are retained per account/guest store. Classic history is separate. Active sessions do not survive reloads. Exported reports include responses and memory stimuli. No analytics, ads or AI API; Cloudflare processes normal hosting request metadata.

## Validation

18 automated tests cover generation across grades/stages, answer correctness, scoring, evidence thresholds, isolation, progression, and authentication integration with mocked provider responses. Live email delivery and Google consent require the owner's configured service and authorised test accounts. The exercises have not been psychometrically validated.

## For coding agents

Start with [AGENTS.md](AGENTS.md), then [current status](docs/STATUS.md), [architecture](docs/ARCHITECTURE.md), and [milestone history](docs/CHANGELOG.md). The user requests tested, reviewed checkpoint commits/pushes and Markdown updates during active work.

## Interests, preferences and family guidance

Open [Discovery](https://reasonlab.simstart.workers.dev/discover.html) for original activity-interest questionnaires, an age-16+ MBTI-style reflection, 24 career families and a printable family guide. These are exploratory exercises, not official MBTI/O*NET assessments, IQ tests or career suitability measures. Read [Discovery design](docs/DISCOVERY-DESIGN.md) for scoring and data handling. Email login awaits owner configuration; [activation guide](docs/AUTH-SETUP.md).
