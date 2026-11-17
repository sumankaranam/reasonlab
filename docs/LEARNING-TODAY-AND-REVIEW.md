# Daily home and vocabulary review

The explored/signed-in hub keeps the three activity paths and adds My Learning Today. Selected learner uses the shared profile setting; course URLs carry `?learner=1|2|3` so the selected child opens the correct French, Indic or reasoning history. Nicknames are escaped. Guests retain separate local progress.

`today-core.js` reads validated course/adventure summaries without changing them. Next action prefers ready due words, a local unfinished activity, an unfinished started course, reasoning for returning learners, then language choice for a new learner. The learning garden grows at 1, 5 and 10 retained completed lesson/adventure records. No streak penalty, ranking or new achievement record is invented. French lesson counts indicate completed/explored activities, not fluency.

`review.html?lang=fr&learner=1` supports French, Tamil and Kannada. `review-core.js` builds stable IDs from language/lesson/word index and stores only review schedules, counts and ratings' effects. Do not reorder existing vocabulary without an ID migration. Cards use trusted course text and available illustrations, with matching-language voice playback only.

Up to five words per learner/language per local calendar day; due words come first. When introducing new words, completed lessons are preferred. Reveal the meaning, then self-rate Still learning or Remembered. Still learning schedules one day later. Remembered intervals grow through 1, 3, 7, 14 and 30 days. Same-day/early repeats do not inflate review counts. These are simple product scheduling rules and self-ratings, not objective mastery or pronunciation assessment. Review does not complete a language lesson.

Storage is account/guest and learner scoped. Review schedules join optional cloud snapshots; active review UI is local. Storage failures are shown. Voice availability varies by device.

Tests: `tests/today.test.mjs`, `tests/review.test.mjs`, corresponding browser suites, and shared theme/navigation coverage. Browser auth/voice/clock fixtures are simulated where noted; static file routing for review is explicitly opt-in with REVIEW_STATIC=1 and never used by live FR_BASE checks.
