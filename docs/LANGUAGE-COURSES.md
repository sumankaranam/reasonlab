# Tamil and Kannada beginner learning

Available at `/tamil.html` and `/kannada.html`, including guest access and existing adult account/child profiles. Tamil offers 12 lessons and Kannada offers 24. Both begin with: greetings, introduction, family, numbers, colors, animals, food, school, polite requests, directions, routine and simple conversation. The first three stages introduce words before everyday exchanges. Kannada adds stages 4–6: Life at home (home, clothes, weather, feelings), Out and about (time, market, travel, sports), and Making plans and keeping in touch (invitations, yesterday, tomorrow, asking for help). Each new lesson includes six vocabulary cards and at least four dialogue turns. Lessons remain available for review.

Native script, roman reading aids and English meanings support beginners. Picture symbols provide visual cues; these are not a full illustrated dictionary. Roman spellings are reading aids, not IPA or exact pronunciation. Tamil uses mostly written/polite forms; everyday speech and regional usage can differ. The short course does not establish intermediate proficiency or fluency.

Listen controls use a matching Tamil or Kannada system/browser voice. If none is installed, the UI explains that audio is unavailable; it must not substitute an English voice. Voice quality and availability depend on the device. No new microphone permission or recordings are used.

Curriculum reference checks: [MSU Basic Tamil](https://openbooks.lib.msu.edu/basictamil/), [CBSE Bhasha Sangam](https://cbseacademic.nic.in/web_material/circulars/2018/guidelines_bhasha_sangam.pdf), and [Karnataka DTE Balake Kannada](https://dtek.karnataka.gov.in/storage/pdf-files/C-20%20syllabus/Balake%20Kannada-2.pdf). Lessons are original short selections, not copied courses. Checks of beginner expressions do not constitute a comprehensive native-teacher review. Seek native educator review before expanding proficiency claims.

Progress is local to this browser, separately keyed for each language, adult account or guest, and learner slot. Signing in does not migrate guest progress, with optional adult-enabled cloud saving for completed progress; unfinished practice stays local. Existing French progress is unchanged.

Implementation: `indic-data.js` curriculum; `indic-engine.js` validated storage and scoring; `indic.js` rendering, account context and optional speech playback; `indic.css` mobile layout. Tests: `tests/indic.test.mjs`, `tests/browser/indic.mjs`, shared landing/themes/contrast suites.

## 2026-11-18 expansion compatibility

Existing lesson IDs, word order, and Tamil content are unchanged. Kannada now has 24 lessons across six stages. New words enter the shared daily review catalog and completed lessons enter the existing optional cloud snapshot. Stage badges remain earned through completed quizzes. Source checks also used [DTE Balake Kannada 1](https://dtek.karnataka.gov.in/storage/pdf-files/CDC/balake%20kannada-1.pdf). Original content still needs comprehensive native-teacher review before proficiency claims.
