# French learning design

Implemented and locally tested 2026-11-16. See STATUS.md for verified deployment state.

## Experience

An original, free French journey for Grades 1–10, independent of reasoning scores. Six skill stages move from first words through everyday language, stories and supported intermediate conversations. Grade guides the adult's suggested approach, not a presumed language level. Every stage remains explorable. No hearts, paid lives, public leaderboards or punitive streaks.

Implemented: 36 short lessons, 257 word/phrase entries (250 distinct phrase/meaning pairs), 12 guided role plays, six bilingual stories, a sound guide, searchable phrasebook, adaptive review and stage checkpoints. Lessons pair explicit examples with reading, listening, sentence building and constrained writing. Content is original and does not copy any commercial app's lessons, characters or branding.

Inspired by short active lessons and spaced retrieval described at https://blog.duolingo.com/duolingo-teaching-method/ and https://blog.duolingo.com/spaced-repetition-for-learning/. Course themes refer to the Council of Europe's can-do progression: https://www.coe.int/en/web/portfolio/the-common-european-framework-of-reference-for-languages-learning-teaching-assessment-cefr-. This is introductory practice through intermediate themes, not a complete accredited CEFR curriculum, placement test or fluency certification.

## Modules and contracts

- `french-data.js`: stages, original lessons, conversations, stories, sound tips and parent prompts. Stable IDs are migration keys.
- `french-engine.js`: pure normalization, exercise generation, first-attempt feedback, validated progress, review scheduling and skill summaries.
- `french-audio.js`: browser speech synthesis, temporary local recordings and separately opted-in recognition; no paid speech or LLM API.
- `french.js`, `french.html`, `french.css`: mobile learning interface, anonymous learner selection, lesson flow, role plays, phrasebook, report and adult controls.

Mixed/text practice completes a lesson; listening-only sets and checkpoints contribute activity feedback. Local progress is separated by verified adult account (or guest) and anonymous learner 1–3. French proficiency is separate from school grade. Completed attempts alone update progress; assisted answers are identified. First-answer accuracy is preserved when a child learns from feedback. Listening revealed as text is counted as assisted, not listening evidence. Stars reflect completed exercise accuracy, never intelligence, pronunciation quality, age rank or certified fluency. Review scheduling uses latest performance and elapsed days; access is never locked.

## Audio and children

No microphone permission at page load. A grown-up gate precedes any microphone use. Default speaking practice records up to 15 seconds for immediate self-listening, held only in memory with no app upload or persistence. Tracks stop on navigation, visibility loss, timeout or cancellation; object URLs are revoked. Playback voices are device/browser-provided, and availability varies. Use a French voice only; text remains available when unavailable.

Optional recognition is separately explained and gated: browsers may send speech to their recognition provider. The app does not control that provider's processing. Transcripts remain temporary. Recognition is feedback on recognized words, not an accent/pronunciation grade or a prerequisite for progression. See https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API . No free-form chatbot, stranger contact, names, location, child email or voice retention.

## Validation and handoff

Test all lesson answer keys and distractors; normalization, review intervals, duplicate completion, malformed storage and identity boundaries. Browser-test learning/retry/skip, review, checkpoint, role play, stories, search, export/deletion, navigation guards and 320/390px layouts. Simulated audio lifecycle tests cannot establish real microphone/voice quality; report that limit honestly. Keep existing Kids/Classic/Discovery tests passing. Deploy on the existing Cloudflare Worker after review, without new paid resources.

## Verification at implementation checkpoint

46 automated tests pass (24 existing, 22 French/audio). Local mobile browser checks pass at 320px and 390px, including first-answer retry preservation, assisted-listening exclusions, constrained writing/accents, token ordering, completion persistence, learner selection across reload, conversations/stories/checkpoints, phrase search, studio opt-ins and denial, export, print, deletion, blocked storage and unsaved navigation. Automated audio tests use simulated speech/microphone devices; real hardware quality was not tested.

No runtime LLM or paid speech service is introduced. A stronger primary model planned/reviewed and integrated the feature; bounded content and audio/test tasks used GPT-6 Luna. Actual cost savings are not measured.

### Reproduce browser QA

Run `npm run dev` in one terminal. Optional QA dependency: `npm install --prefix work/browser-check --no-save playwright@1.65.1`, then `node work/browser-check/node_modules/playwright/cli.js install chromium` if a browser is not installed. Run from the repository root:

```sh
node tests/browser/french-mobile.mjs
node tests/browser/french-edge.mjs
```

`FR_BASE` overrides the default local URL for deployed checks. `PLAYWRIGHT_EXECUTABLE_PATH` selects an existing Chromium executable. `PLAYWRIGHT_MODULE` optionally selects a different installed Playwright module. QA outputs go to ignored `work/`; the dependency directory already creates that folder. The edge check injects simulated voice/mic adapters and never requests access to real hardware. Some Windows sandbox profiles require running the local server and browser outside the sandbox to allow loopback traffic.
