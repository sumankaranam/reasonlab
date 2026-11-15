# Interests, preferences, careers and family guidance

Updated 2026-11-15. Original editorial content, version 1; no licensed assessment items.

## Product scope

`/discover.html` (Cloudflare canonical `/discover`) adds three independent views: questionnaires/reports, a searchable career explorer, and a printable family guide. Guest access remains the default. Kids and Classic scores and histories are preserved.

- Grades 1–3: 18 interest prompts; Grades 4–10: 36. A grown-up may read aloud, but the learner chooses. These grade bands are editorial choices, not validated norms.
- Personality: 32 original bipolar prompts, 8 per EI/SN/TF/JP pair, with a mandatory self-declaration that the respondent is 16+ and answering about themselves. This is not verified age. Do not infer age from grade, or let an adult rate a child as a substitute.
- No official MBTI assessment, certification, diagnosis, IQ, learning-style classification, occupational suitability or job-success prediction is claimed. Mixed preferences remain mixed, rather than forcing all users into one of 16 labels.
- Career ideas use expressed activity interests only. Personality and cognitive practice results never influence career ordering or exclude paths. The guide uses practice results solely to suggest practice support.

## Modules

| File | Ownership |
| --- | --- |
| `public/discovery-data.js` | Original prompts, preference explanations, six interest areas, 24 career families, parenting topics, age guides, reference links |
| `public/discovery-engine.js` | Pure question selection, scoring, record validation, account keys, learner/grade filtering, editorial career ordering |
| `public/discovery.js` | Accessible questionnaire flow, local persistence, account changes, reports, exports, career search/filter, family guide |
| `public/discovery.css` | Responsive and print styles, using existing ReasonLab palette |
| `public/discover.html` | Static entry point; no build step |
| `public/signin-setup.html` | Public owner-facing activation steps, linked from unconfigured sign-in |
| `tests/discovery.test.mjs` | Scale coverage, reverse scoring/all 16 pole combinations, missing data, career order and data isolation |

## Scoring contract

Preferences use answers 1–5. Every other question reverses its visible poles; reverse answers are transformed with `6 - answer`. For each dimension: `round((mean - 1) * 25)` gives a 0–100 response position. It is not a confidence level, percentile or ability score. At least 6/8 responses are required per dimension. Positions <40 use the first pole; >60 use the second; 40–60 use X (mixed). A four-character code is shown only when every dimension meets the minimum. Thresholds are product choices, not psychometric standards.

Interests average 1–5 ratings separately in six RIASEC-inspired areas. Each area needs at least 2/3 answers for Grades 1–3 or 4/6 for Grades 4–10. A skip is null and is excluded, never converted to neutral or zero. The UI requires a response or explicit skip on every screen; completed records retain original answers. All-skipped records are allowed but yield no complete profile or personalised order.

Each career family has two editorial tags. Average the corresponding 0–100 interest positions to sort suggestions. No fit percentage is shown. All 24 families remain accessible. Ties have no meaningful rank. Uniformly low ratings do not count as strong interests; the family guide explains this. Suggestions are not a validated RIASEC-to-occupation model and do not reproduce O*NET occupational data.

## State and storage

Draft answers remain in memory; leaving/reloading warns and discards them. Completed reports are stored under `reasonlab-discovery-v1` (guest) or `reasonlab-discovery-v1:<verified adult UUID>`, maximum 60 records across learner slots. Each record has version, kind, learner 1–3, grade 1–10, date, self16 declaration and answers. No child names, emails or dates of birth are requested. Raw responses are local and unencrypted.

Read settings initially from the existing Kids account namespace; Discovery selections are page-local and do not silently change Kids settings. Saved reports are filtered by learner and grade. Career/guide views use the newest questionnaire of each kind, including incomplete-evidence results; they do not silently fall back to an older stronger result. The report view explicitly notes this difference when viewing an older report.

Auth uses the existing verified Supabase user flow. Account changes clear questionnaire/report state and reload the correct namespace; no guest import or cross-device sync. Storage failures produce a visible warning and exports remain available. Deleting a learner/grade’s Discovery records preserves other learners and all Kids/Classic data; a failed deletion write is reported instead of claiming success.

The family guide reads validated local Kids check-in summaries and calls the existing `evidence()` per stage. It retains minimum evidence and assisted/incomplete exclusions. It never pools stages or treats practice as a validated cognitive measure.

## UI and accessibility

Native radio inputs with fieldsets/legends, explicit next/back, visible focus, question count, progress, a skip choice and review links. Responses are not auto-advanced. Mobile options stack into large targets. Navigation guards cover internal views and external links while answering. Reports and the family guide support browser printing/PDF and local JSON exports; users choose sharing. Exports contain responses and should be treated as personal records. No answers are included in external occupation search URLs.

## Content coverage

24 career families cover technical, creative, practical, care, education, public service, enterprise and administrative work. Each includes example roles, a low-cost project, reflection question, supporting subjects, age-band next steps and a US O*NET research link. Subjects are not entry requirements; qualifications/licensing depend on location. No current salary, labour-market, college or credential recommendations are supplied.

Family guidance includes Grades 1–3 / 4–6 / 7–10 activities, child-led reflection, current interest prompts, optional 16+ preference experiments, stage-specific learning support, a flexible four-week plan and 10 expandable everyday parenting topics. Guidance is editorial and nonclinical. Persistent concerns are directed to the school or an appropriately qualified professional without suggesting a diagnosis.

## Sources and licensing boundaries

- [Myers & Briggs ethical use](https://www.myersbriggs.org/using-type-as-a-professional/mbti-code-of-ethics/): preferences are not abilities; avoid directing career choices solely from type.
- [O*NET Interest Profiler](https://www.onetcenter.org/IP.html): background on the six RIASEC interest areas; our items and mapping are original and not the official instrument.
- [UNICEF communicating with teens](https://www.unicef.org/parenting/child-care/11-tips-communicating-your-teen): reference for listening, discussion and supportive communication, not validation of our generated guide.

Do not copy proprietary MBTI questions, claim these scales are validated, present editorial cutoffs as norms, or use this app for selection/admission decisions. A future validated assessment requires separate research, permissions, appropriate norms, reliability/fairness evidence and qualified review.

## Verification and remaining work

24 total automated tests pass. Live Chromium checks passed at 390px and 320px for questionnaire completion, scoring, response edits, navigation guards, saved history, learner isolation, career filtering, exports and age-band family guidance. Additional checks covered all-skipped results, deletion, unavailable storage, print expansion/restoration and PDF generation. Mobile screenshots were inspected. A long-code-token overflow in the email setup page was fixed; printing temporarily opens all details and restores their prior state. Cloudflare version: `6e683736-e11f-4129-8ded-215b11c98e64`. Email delivery remains blocked on owner setup by explicit user choice; see `AUTH-SETUP.md`. No real provider flow has been verified. Future work may add translations, curriculum alignment and researched activity banks, but must retain the separation of interests, preferences and practice evidence.
