# ReasonLab

Mobile-friendly reasoning, French/Tamil/Kannada learning and interest exploration for Grades 1–10. Live: https://reasonlab.simstart.workers.dev

## Features

- My Learning Today: per-learner next steps, language continuation, due word reviews and a growing learning garden.
- Five-word spaced vocabulary review in French, Tamil and Kannada.
- Optional adult cloud saving across devices, with explicit conflict choices and cloud deletion. See [cloud progress](docs/CLOUD-PROGRESS.md) for included data and verification limits.

- Reasoning Adventures: four illustrated puzzle worlds, three difficulty levels, five-puzzle daily sets, twelve-puzzle weekly challenges, focused practice, explanations, achievements and a learner progress dashboard at `/adventures.html`. Existing grade practice remains at `/kids.html`.

- Ten grade starting points, three stages each: Discover, Build and Stretch.
- Daily discovery (12 questions), skill check-ins (20), targeted practice (8/12/20).
- Number patterns, visual patterns, logical thinking and briefly displayed digit recall; higher levels include reverse recall.
- Explanations, downloadable feedback, three anonymous learner slots, learning map and stage suggestions.
- Optional adult Google sign-in and email one-time code integration through Supabase.
- Guest access; original app and its history remain at `/classic.html`.
- French learning: 48 lessons in eight stages, vocabulary, grammar, sentence building, listening, 12 guided conversations, six stories, a phrasebook and reference shelf. Local review reminders and learner progress. Open `/french.html`.
- Tamil and Kannada: 12 beginner lessons each, picture-symbol flashcards, native script with roman reading aids, meaning quizzes, stage badges, saved place and short dialogues. Open `/tamil.html` or `/kannada.html`. Audio needs a matching device voice. See [course scope](docs/LANGUAGE-COURSES.md).
- French speech playback, temporary local record/replay and separately opted-in browser recognition. Device/browser support varies; recognition is not a pronunciation grade.

## Authentication status

**Google sign-in is enabled; email codes remain disabled pending sender setup.** The public Supabase configuration and Google provider were checked. Real Google consent/callback completion has not been verified by the automated tests. There is no fake login. Owner instructions stay in [the project activation guide](docs/AUTH-SETUP.md), outside deployed public assets. There is no public setup page.

Google sign-in requests only basic identity scopes, never inbox access. Email codes support Gmail, Outlook, Yahoo and other receiving addresses once custom SMTP is configured.

## Run and test

Requires Node.js 22.13 or newer (the cloud database tests use node:sqlite):

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

Up to 150 kids-session summaries are retained per account/guest store. Classic history is separate. Unfinished Kids/Classic sessions do not survive reloads; French activities have resumable checkpoints. Exported reports include responses and memory stimuli. Aggregate page/estimated-visit counts are collected with browser opt-out; no child identifiers or answers enter usage totals. No ads or AI API. Cloudflare processes normal hosting request metadata.

## Validation

78 automated tests cover generation across grades/stages, answer correctness, scoring, evidence thresholds, isolation, progression, French content/review/audio lifecycle, and authentication integration with mocked provider responses. Mobile French browser checks cover activity flows, saved state, speaking gates, denial handling, reports and 320/390px layouts. Audio hardware is simulated in automated checks. Live email delivery and Google consent require the owner's configured service and authorised test accounts. The exercises have not been psychometrically validated.

## For coding agents

Start with [AGENTS.md](AGENTS.md), then [current status](docs/STATUS.md), [architecture](docs/ARCHITECTURE.md), and [milestone history](docs/CHANGELOG.md). The user requests tested, reviewed checkpoint commits/pushes and Markdown updates during active work.

## Interests, preferences and family guidance

Open [Discovery](https://reasonlab.simstart.workers.dev/discover.html) for original activity-interest questionnaires, an age-16+ MBTI-style reflection, 24 career families and a printable family guide. These are exploratory exercises, not official MBTI/O*NET assessments, IQ tests or career suitability measures. Read [Discovery design](docs/DISCOVERY-DESIGN.md) for scoring and data handling. Email login awaits owner configuration; [activation guide](docs/AUTH-SETUP.md).

## French learning and speech privacy

Read [French design](docs/FRENCH-DESIGN.md) for curriculum, first-answer scoring, module contracts and review scheduling. The course introduces beginner through intermediate themes; completing it is not a CEFR certificate or proof of conversational fluency. School grade changes family guidance, not assumed French skill.

Each anonymous learner has local French progress under the verified adult account or guest context, with up to 100 activity summaries. No audio or transcripts are stored in progress or exports. Local record-and-replay uses a temporary in-memory recording (15 seconds maximum), with no app upload. Optional browser recognition may send audio to the browser provider; it needs a separate grown-up opt-in. Text and listen-only learning never require a microphone. No paid speech or LLM API is used.

## Guided French learning path

French now has six ordered chapters, a saved weekly plan, a recommended next step, bright picture flashcards and a conversation passport. Pause or close an activity and resume the saved question/card on the same device. Six additional conversation missions connect the lessons to simple exchanges; achievements have explicit lesson/mission requirements rather than rewarding skipped questions. Read [the learning path](docs/FRENCH-LEARNING-PATH.md).

Checkpoint, plan and progress are separate for each anonymous learner within the verified adult account or guest context. Existing progress is retained. This does not activate Google/email providers or add cross-device sync. Audio is not saved, and microphone permission is never resumed automatically.

## Child profiles and themes

Adult accounts can name up to three learner slots with nicknames and choose from ten original avatars. Shared banners show the selected child and a guarded sign-out control. Six illustrated themes—Classic Garden, Unicorn Rainbow, Racing Cars, Fairy-tale Castle, Space Explorers and Ocean Friends—use one website-wide choice on the current device, including Classic and Account. Guests can choose themes too. The language selector offers French; Spanish, German, Hindi and Japanese are marked Coming soon. See `docs/ARCHITECTURE.md` for storage and module details.

## Owner usage reports

Aggregate daily page views and estimated tab visits are collected without child/account identifiers, with browser opt-out controls. A 9 AM India-time cloud schedule is prepared for an owner email; Resend sender and private Supabase registration-count setup remain pending. See [daily report setup](docs/DAILY-REPORT-SETUP.md). Visits are not unique people; collection starts at deployment.

## Welcome and navigation

Start at `/`: choose adult sign-in or guest exploration, then Language learning, Reasoning & memory, or Interests & personality. Returning adults and guests in the same tab go to the activity hub. French is available; other language courses are marked Coming soon. Reasoning is at `/kids.html`; existing progress is preserved. Every learning section has guarded navigation back to the hub.
