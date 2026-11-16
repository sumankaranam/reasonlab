# Reasoning Adventures

## Product scope

Four original puzzle journeys: Pattern Detective, Logic Stories, Visual Reasoning and Memory Adventures. Each has Discover, Build and Stretch difficulty. Daily Adventures mix five puzzles; weekly challenges mix twelve (three per area); focused practice uses six. Short teaching tips, hints and answer explanations support practice. These exercises are not standardized IQ tests, school-board assessments or diagnoses.

Grades 1–3 start at Discover, 4–6 at Build and 7–10 at Stretch. These broad starting points are design choices. Children can select a comfortable level, and a grown-up may read instructions aloud. Suggestions use the latest two completed practices in the same area and at the same level. Both must be independent: at least 80% on both suggests moving up one level; at most 50% on both suggests moving down one. Suggestions stay within the three levels; no automatic lockout or grade ranking.

The landing-page reasoning card opens `/adventures.html`. Existing grade practice remains at `/kids.html`, linked from adventures, and Classic remains available. Existing histories are not migrated or overwritten.

## Scoring and feedback contract

First answers are retained. Hints mark assistance; an interrupted memory display marks interruption. Daily/practice exercises give explanatory feedback. Weekly summaries provide evidence only when complete, without assistance or interruption. Only the first completed attempt at a given week's challenge and level can supply independent evidence. A later retry cannot replace an earlier score or turn an assisted first attempt into independent evidence.

Skill feedback uses recent eligible weekly challenges at the selected level, requiring at least two distinct weeks and six questions per area. With sufficient evidence, 80% or higher is Doing well, 50–79% Developing, and below 50% Needs more practice. These are transparent product thresholds, not validated norms. The UI must explain why evidence is insufficient and must not infer a fixed intelligence or learning style.

Achievements reward completed activities and defined practice milestones; they are not certificates. Hinted work stays visible as supported practice. Incomplete or discarded sessions do not create achievements or weekly evidence.

## Memory interaction

A learner starts the display when ready. Stimuli appear briefly, then are removed from the DOM before choices appear. Hide/leave events stop the timer and mark interruption. A delayed timeout after browser suspension must not count as independent performance. No speed ranking is used. Screen-reader timing and device behavior can affect this activity.

## Storage and privacy

Use verified adult identity or guest context plus one of three learner slots. Only bounded session summaries are saved in browser-local storage, separately from legacy Kids history. No cloud progress sync, audio upload, child email, LLM request or personal analytics is added. Storage failures must be visible without breaking practice. Active sessions are in memory and require a discard confirmation before leaving.

Aggregate page views share the existing Kids/reasoning category. They contain no responses or learner identity. Existing reporting setup requirements remain unchanged.

## Extension and validation

`adventure-engine.js` owns deterministic original question generation, scoring, summary validation, evidence selection and progression. `adventures.js` owns session transitions, auth context and memory timing. `adventures.css` owns original illustrated cards and responsive presentation. Keep authored text escaped; generated visuals are trusted symbols, not arbitrary saved markup.

Validate generator invariants over many seeds and levels, independently check answers where possible, reject corrupt stored counts, and test weekly deduplication, assistance/interruption exclusion and account separation. Browser checks cover 320px layouts, first-answer locking, hints, memory transitions, leave guards and storage failure. Theme contrast checks are targeted regression coverage, not a full accessibility certification.
