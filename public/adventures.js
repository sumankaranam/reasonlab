import {service, onAccountChange} from './auth-client.js';
import {progressKeys} from './auth-core.js';
import {readProfiles} from './child-profiles.js';
import {showChildHeader} from './child-profile-ui.js';
import {
  areas, levelNames, makeSession, storageKey, defaultLevel, periodKey, seedFor,
  summarize, cleanHistory, evidence, suggestedLevel, badges
} from './adventure-engine.js';

const slots = [1, 2, 3];
const main = document.querySelector('#adventures');
const confirmBox = document.querySelector('#adventure-confirm');
const saveStatus = document.querySelector('#adventure-save-status');
const pageNav = document.querySelector('#adventure-map');
const progressNav = document.querySelector('#adventure-progress');
const find = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[char]);
const labels = {daily:'Daily quest', weekly:'Weekly check-in', practice:'Journey practice'};
const journeys = {
  patterns: {
    title:'Pattern Detective',
    art:'<path d="M0 105Q75 52 152 110T290 84V120H0Z" fill="#f7cb7d"/><path d="M18 98h62" stroke="#fff4d1" stroke-width="4" stroke-dasharray="6 6"/><circle cx="44" cy="59" r="13" fill="#b85545"/><path d="m78 72 13-25 13 25Z" fill="#7f57a1"/><circle cx="127" cy="59" r="13" fill="#b85545"/><circle cx="181" cy="52" r="32" fill="#fff0cd" stroke="#52334c" stroke-width="8"/><path d="m204 75 30 28" stroke="#52334c" stroke-width="12" stroke-linecap="round"/><path d="m166 65 15-29 15 29Z" fill="#7f57a1"/>'
  },
  logic: {
    title:'Logic Stories',
    art:'<path d="M0 88Q70 71 134 92T260 79V120H0Z" fill="#a1d6a4"/><path d="M0 118Q35 86 97 104T193 86L215 92Q150 128 80 118Z" fill="#f8e2ad"/><g fill="#4a8c64"><path d="M22 82 47 26l25 56Z"/><path d="M185 80l24-60 25 60Z"/><path d="M53 89l22-42 22 42Z"/></g><path d="M127 107V26" stroke="#765043" stroke-width="6"/><path d="M99 37h58l13 12-13 12H99ZM154 68H99L86 79l13 11h55Z" fill="#d88956"/><path d="m126 49 11 0m-5-5 5 5-5 5m-5 25h-11m5-5-5 5 5 5" fill="none" stroke="#5a392f" stroke-width="3" stroke-linecap="round"/>'
  },
  visual: {
    title:'Visual Reasoning',
    art:'<circle cx="82" cy="64" r="33" fill="#8067c9"/><path d="M37 77c-10-8 80-44 98-37s-74 49-98 37Z" fill="none" stroke="#6e55a6" stroke-width="4"/><path d="m161 30 25-16 26 16-3 30-23 16-22-15Z" fill="#ffe5a8" stroke="#663e8a" stroke-width="3"/><path d="m161 30 25 16 26-16m-26 16v30" fill="none" stroke="#663e8a" stroke-width="3"/><path d="m153 77 15 16-15 17-16-17Z" fill="#b45388"/><g fill="#fff"><path d="m31 31 6 10-6 10-6-10Z"/><path d="m220 75 5 9-5 9-5-9Z"/><circle cx="113" cy="16" r="3"/><circle cx="49" cy="99" r="3"/><circle cx="189" cy="105" r="3"/></g>'
  },
  memory: {
    title:'Memory Adventures',
    art:'<path d="M0 78q36-13 74 0t70 0 116-1v43H0Z" fill="#85cdd1"/><path d="M0 102q33-10 77 0t86-3 97-4v25H0Z" fill="#65b8bd"/><ellipse cx="128" cy="97" rx="73" ry="12" fill="#fbe2a2"/><path d="M79 61q0-20 23-26h44q22 3 23 26v30H79Z" fill="#a75a4f" stroke="#62404c" stroke-width="4"/><path d="M79 63h90M101 37v53m46-53v53" stroke="#efbb62" stroke-width="7"/><rect x="115" y="58" width="18" height="16" rx="3" fill="#ffd77f" stroke="#62404c" stroke-width="2"/><path d="m51 45 8 12-8 12-8-12Zm131-25 7 11-7 11-7-11Zm26 36 6 10-6 10-6-10Z" fill="#fff6cb"/>'
  }
};
const hero = '<svg viewBox="0 0 370 250" aria-hidden="true" focusable="false"><path d="M20 138C89 7 290 3 349 88S281 245 118 230 7 169 20 138Z" fill="#35316d"/><path d="M52 174c38 17 102 41 128 11s-66-50-40-82 94 11 152-49" fill="none" stroke="#bdb1f1" stroke-width="4" stroke-dasharray="6 12" stroke-linecap="round"/><g fill="#ffc985"><path d="m297 28 7 15 17 3-13 11 3 17-14-8-15 8 3-17-12-11 17-3Z"/><path d="m74 56 5 11 11 5-11 5-5 11-5-11-11-5 11-5Z"/></g><circle cx="62" cy="170" r="31" fill="#a9dfbb"/><path d="m52 170 8 8 15-17" fill="none" stroke="#263e55" stroke-width="5" stroke-linecap="round"/><rect x="117" y="77" width="61" height="61" rx="18" fill="#d5c4ff" transform="rotate(-14 148 108)"/><path d="m132 120 15-25 15 25Z" fill="none" stroke="#49386f" stroke-width="4" stroke-linejoin="round"/><circle cx="181" cy="183" r="31" fill="#ffd8af"/><circle cx="179" cy="180" r="10" fill="none" stroke="#633c5a" stroke-width="4"/><path d="m186 188 10 10" stroke="#633c5a" stroke-width="5" stroke-linecap="round"/><g fill="#d6ccff"><circle cx="248" cy="172" r="4"/><circle cx="307" cy="143" r="4"/><circle cx="241" cy="61" r="3"/><circle cx="108" cy="43" r="3"/></g></svg>';

const scene = id => '<svg class="adv-scene ' + id + '" viewBox="0 0 250 120" aria-hidden="true" focusable="false">' + journeys[id].art + '</svg>';
const areaName = id => areas.find(area => area.id === id)?.name || 'All journeys';
const examples = {
  patterns: {clues:['2', '4', '6', '?'], steps:['Compare 2 and 4, then 4 and 6. Both steps add 2.', 'Add 2 to 6 to get 8.']},
  logic: {clues:['Mia is ahead of Sam.', 'Sam is ahead of Ravi.'], steps:['Put Mia before Sam.', 'Put Ravi after Sam. Mia is first.']},
  visual: {clues:['↑', '→', '↓', '?'], steps:['The arrow turns a quarter turn clockwise each time.', 'Turn the down arrow a quarter turn clockwise. It points left (←).']},
  memory: {clues:['4', '2', '7', '9'], steps:['Group the digits as 4 2 and 7 9 to help remember the order.', 'The third digit is the first digit of the second group. It’s 7.']}
};

let user;
let slot = 1;
let grade = 3;
let level = 1;
let history = [];
let session = null;
let view = 'map';
let timer;
let pending;
let identityRevision = 0;
let verifying = true;
let storageWarning = false;

function render(content, focus = true) {
  main.innerHTML = content;
  pageNav.classList.toggle('active', view === 'map');
  progressNav.classList.toggle('active', view === 'progress');
  if (focus) main.querySelector('h1')?.focus();
}

function status() {
  saveStatus.hidden = !storageWarning;
  saveStatus.textContent = storageWarning ? 'Browser storage is unavailable. You can keep playing, but changes may disappear when you leave.' : '';
}

function settingsKey() {
  return progressKeys(user?.id ?? null).settings + ':adventures';
}

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { storageWarning = true; return null; }
}

function write(key, value) {
  if (verifying) return false;
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { storageWarning = true; status(); return false; }
}

function setLearner(nextSlot) {
  slot = nextSlot;
  const settings = read(settingsKey())?.[slot];
  const shared = read(progressKeys(user?.id ?? null).settings);
  grade = Number.isInteger(settings?.grade) && settings.grade >= 1 && settings.grade <= 10
    ? settings.grade : Number.isInteger(shared?.grade) && shared.grade >= 1 && shared.grade <= 10 ? shared.grade : 3;
  level = [1, 2, 3].includes(settings?.level) ? settings.level : defaultLevel(grade);
  history = cleanHistory(read(storageKey(user?.id ?? null, slot)));
  status();
  showChildHeader(user, slot, navigate, service);
  find('#account-link').textContent = user ? 'Adult account' : 'Adult sign in';
  saveStatus.after(find('#theme-dock'));
}

function saveSettings() {
  const settings = read(settingsKey()) || {};
  write(settingsKey(), {...settings, slot, [slot]:{grade, level}});
  status();
}

function selected(value, current) {
  return value === current ? ' selected' : '';
}

function map(focus = true) {
  view = 'map';
  const profiles = user ? readProfiles(user.id) : {};
  render(`
    <section class="adv-hero">
      <div><h1 tabindex="-1">Reasoning <span>Adventures</span></h1>
        <p>Follow clues, spot patterns and see what you can remember. Pick a journey or try a little of everything.</p></div>
      ${hero}
    </section>
    <div class="adv-controls">
      <label>Learner <select id="adv-slot">${slots.map(n => `<option value="${n}"${selected(n, slot)}>${esc(profiles[n]?.name || 'Learner ' + n)}</option>`).join('')}</select></label>
      <label>Grade <select id="adv-grade">${Array.from({length:10}, (_, i) => i + 1).map(n => `<option value="${n}"${selected(n,grade)}>Grade ${n}</option>`).join('')}</select></label>
      <label>Level <select id="adv-level">${levelNames.map((name, i) => `<option value="${i + 1}"${selected(i + 1,level)}>${esc(name)}</option>`).join('')}</select></label>
      <p>Choose the level that feels right. Grades suggest a starting level.</p>
    </div>
    <div class="adv-modes">
      <section class="adv-panel adv-mode">
        <span class="adv-mode-icon" aria-hidden="true">☀️</span>
        <h2>Daily quest</h2><p>Five puzzles from across the map.</p>
        <button class="primary" id="adv-daily">Start daily quest</button>
      </section>
      <section class="adv-panel adv-mode">
        <span class="adv-mode-icon" aria-hidden="true">🧭</span>
        <h2>Weekly check-in</h2><p>Twelve puzzles. See how your practice is going.</p>
        <button class="primary" id="adv-weekly">View check-in</button>
      </section>
    </div>
    <section aria-labelledby="adv-journeys"><h2 id="adv-journeys">Pick a journey</h2>
      <div class="adv-grid">${areas.map(area => `
        <article class="adv-journey">${scene(area.id)}
          <div class="adv-journey-body"><h3>${journeys[area.id].title}</h3>
            <p>${esc(area.description)}</p>
            <button class="secondary" data-journey="${area.id}" aria-label="Explore ${journeys[area.id].title}">Explore →</button>
          </div></article>`).join('')}</div>
    </section>
    <div class="actions"><a href="/kids.html">More grade practice</a></div>
  `, focus);
  find('#adv-slot').onchange = event => {
    setLearner(Number(event.target.value));
    saveSettings();
    map(false);
    find('#adv-slot').focus();
  };
  find('#adv-grade').onchange = event => {
    grade = Number(event.target.value);
    level = defaultLevel(grade);
    saveSettings();
    find('#adv-level').value = level;
  };
  find('#adv-level').onchange = event => { level = Number(event.target.value); saveSettings(); };
  find('#adv-daily').onclick = () => start('daily');
  find('#adv-weekly').onclick = weeklyIntro;
  main.querySelectorAll('[data-journey]').forEach(button => {
    button.onclick = () => lesson(button.dataset.journey);
  });
}

function lesson(id) {
  const area = areas.find(item => item.id === id);
  const example = examples[id];
  view = 'lesson';
  render(`<section class="adv-panel adv-narrow">
    <div class="adv-lesson-scene">${scene(id)}</div>
    <h1 tabindex="-1">${journeys[id].title}</h1>
    <p>${esc(area.description)}</p>
    <div class="adv-tip"><strong>Try this</strong><p>${esc(area.tip)}</p></div>
    <div class="adv-example"><h2>Let’s solve one together</h2>
      <ul class="adv-clues" aria-label="Example clues">${example.clues.map(clue => `<li>${esc(clue)}</li>`).join('')}</ul>
      <ol>${example.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>
    </div>
    <div class="actions"><button id="adv-practice" class="primary">Start practice · 6 puzzles</button>
      <button id="adv-back" class="secondary">Adventure map</button></div>
  </section>`);
  find('#adv-practice').onclick = () => start('practice', id);
  find('#adv-back').onclick = () => map();
}

function isRepeatWeek(period, difficulty, records = history) {
  return records.some(record => record.mode === 'weekly' && record.complete &&
    record.period === period && record.level === difficulty);
}

function weeklyIntro() {
  const saved = cleanHistory(read(storageKey(user?.id ?? null, slot)));
  const repeat = isRepeatWeek(periodKey('weekly', new Date()), level, [...saved, ...history]);
  status();
  view = 'weekly';
  render(`<section class="adv-panel adv-narrow">
    <h1 tabindex="-1">Weekly check-in</h1>
    <p>Try twelve puzzles at ${esc(levelNames[level - 1])} level. You’ll see your answers and explanations when you finish.</p>
    <p>The first completed check-in of the week at this level counts toward independent progress if you finish without hints or interruptions.</p>
    ${repeat ? '<p role="status">You’ve finished this week’s check-in at this level. Pick a journey for more practice.</p>' : ''}
    <div class="actions">${repeat ? '' : '<button id="adv-start-weekly" class="primary">Start weekly check-in</button>'}
      <button id="adv-back" class="secondary">Adventure map</button></div>
  </section>`);
  find('#adv-start-weekly')?.addEventListener('click', () => start('weekly'));
  find('#adv-back').onclick = () => map();
}

function start(mode, area = 'all') {
  if (verifying) return;
  const date = new Date();
  const period = periodKey(mode, date);
  if (mode === 'weekly' && isRepeatWeek(period, level)) { weeklyIntro(); return; }
  const random = crypto.getRandomValues(new Uint32Array(2));
  const seed = mode === 'practice' ? random[0] : seedFor([mode, period, slot, level].join(':'));
  const questions = makeSession({seed, mode, area, level});
  session = {
    id: date.getTime() + '-' + random[0] + '-' + random[1], mode, area, level, date, period,
    questions, index:0, memory:'ready', hint:false,
    responses:questions.map(() => ({answer:null, assisted:false, interrupted:false}))
  };
  question();
}

function currentResponse() {
  return session.responses[session.index];
}

function question(focus = '#adv-prompt') {
  view = 'question';
  const {questions, index, memory, mode, hint} = session;
  const item = questions[index];
  const response = currentResponse();
  const locked = response.answer !== null;
  const canAnswer = !item.memory || memory === 'hidden';
  const itemFeedback = locked && mode !== 'weekly';
  const title = item.memory && !canAnswer ? 'Look closely and remember' : item.prompt;
  render(`<section class="adv-panel adv-narrow">
    <div class="adv-meta"><span>${labels[mode]} · ${esc(areaName(item.area))}</span><span>Puzzle ${index + 1} of ${questions.length}</span></div>
    <progress class="adv-meter" value="${index + Number(locked)}" max="${questions.length}" aria-label="Puzzles answered"></progress>
    <h1 id="adv-prompt" tabindex="-1">${esc(title)}</h1>
    ${item.memory && !canAnswer ? `
      <div class="adv-memory">
      ${memory === 'ready' ? '<p>See what you can remember. The clue will disappear after a few seconds.</p><button id="adv-ready" class="primary">Show the clue</button>' :
        `<strong id="adv-stimulus" tabindex="-1">${esc(item.memory.stimulus)}</strong>`}
      </div>` : `
      ${response.interrupted ? '<p role="status">The clue was interrupted. This puzzle still counts as practice.</p>' : ''}
      ${item.visual?.length && !item.memory ? `<ul class="adv-clues" aria-label="Clues">${item.visual.map(clue => `<li>${esc(clue)}</li>`).join('')}</ul>` : ''}
      <div class="adv-options">${item.options.map((answer, i) => `
        <button class="adv-option" data-answer="${i}" ${locked ? 'disabled' : ''}
          ${answer === response.answer ? ' data-selected aria-label="Your answer: ' + esc(answer) + '"' : ''}>${esc(answer)}</button>`).join('')}
      </div>
      ${hint ? `<div class="adv-tip" id="adv-hint-text" tabindex="-1"><strong>Hint used</strong><p>${esc(item.hint)}</p></div>` : ''}
      ${itemFeedback ? `<div class="adv-feedback" id="adv-answer-status" tabindex="-1">
        <strong>${response.answer === item.answer ? 'You got it!' : 'Here’s how to work it out'}</strong>
        <p>Answer: ${esc(item.answer)}. ${esc(item.explanation)}</p></div>` :
        locked ? '<p class="adv-feedback" id="adv-answer-status" tabindex="-1">Answer saved. You can review it at the end.</p>' : ''}
      <div class="actions">
        ${locked ? `<button class="primary" id="adv-next">${index + 1 === questions.length ? 'See results' : 'Next puzzle'}</button>` :
          !hint ? '<button class="secondary" id="adv-hint">Get a hint</button>' : ''}
      </div>`}
  </section>`, false);
  find('#adv-ready')?.addEventListener('click', showMemory);
  main.querySelectorAll('[data-answer]').forEach(button => {
    button.onclick = () => answer(item.options[Number(button.dataset.answer)]);
  });
  find('#adv-hint')?.addEventListener('click', () => {
    if (currentResponse().answer !== null) return;
    currentResponse().assisted = true;
    session.hint = true;
    question('#adv-hint-text');
  });
  find('#adv-next')?.addEventListener('click', nextQuestion);
  if (focus) find(focus)?.focus();
}

function showMemory() {
  if (session.memory !== 'ready') return;
  session.memory = 'showing';
  const active = session;
  const index = session.index;
  const duration = session.questions[index].memory.durationMs;
  session.deadline = Date.now() + duration;
  session.monotonicDeadline = performance.now() + duration;
  question('#adv-stimulus');
  if (document.hidden) hideMemory(true);
  else timer = setTimeout(() => {
    if (session === active && session.index === index) {
      hideMemory(document.hidden || Date.now() > session.deadline + 140 ||
        performance.now() > session.monotonicDeadline + 140);
    }
  }, duration);
}

function hideMemory(interrupted) {
  if (session?.memory !== 'showing') return;
  clearTimeout(timer);
  currentResponse().interrupted ||= interrupted;
  session.memory = 'hidden';
  question();
}

function answer(value) {
  const item = session.questions[session.index];
  if (item.memory && session.memory !== 'hidden') {
    if (session.memory === 'showing' && Date.now() >= session.deadline) hideMemory(true);
    return;
  }
  const response = currentResponse();
  if (verifying || response.answer !== null) return;
  if (document.hidden) response.interrupted = true;
  response.answer = value;
  question('#adv-answer-status');
}

function nextQuestion() {
  if (verifying || currentResponse().answer === null) return;
  if (session.index + 1 === session.questions.length) {
    finish();
    return;
  }
  session.index += 1;
  session.memory = 'ready';
  session.hint = false;
  question();
}

function finish() {
  const completed = session;
  const record = summarize({...completed, date:new Date()});
  session = null;
  let repeat = false;
  if (record.complete) {
    const key = storageKey(user?.id ?? null, slot);
    const saved = cleanHistory(read(key));
    repeat = record.mode === 'weekly' && isRepeatWeek(record.period, record.level, [...saved, ...history]);
    history = cleanHistory([...new Map([...history, ...saved, record].map(entry => [entry.id, entry])).values()]);
    write(key, history);
  }
  status();
  view = 'result';
  const supported = completed.responses.filter(response => response.assisted || response.interrupted).length;
  const eligible = record.mode === 'weekly' && record.complete && supported === 0 && !repeat;
  render(`<section class="adv-panel adv-narrow">
    <h1 tabindex="-1">${esc(labels[completed.mode])} complete!</h1>
    <p><strong>${record.correct} of ${record.total} correct.</strong> ${record.total - supported} answered independently and ${supported} with a hint or interruption.</p>
    <p>${eligible ? 'This check-in can count toward independent progress.' :
      repeat ? 'This check-in gives you practice. Your first completed check-in at this level this week determines eligibility.' :
      completed.mode === 'weekly' ? 'This check-in gives you practice. Independent progress uses check-ins finished without hints or interruptions.' :
      'Practice helps you try new strategies.'}</p>
    <div class="actions"><button id="adv-results-map" class="primary">Adventure map</button>
      <button id="adv-results-progress" class="secondary">See progress</button></div>
    <div class="adv-result-review"><h2>Review the puzzles</h2>
      ${completed.questions.map((item, index) => `<details>
        <summary>Puzzle ${index + 1} · ${esc(areaName(item.area))} · ${completed.responses[index].answer === item.answer ? 'Correct' : 'Try again next time'}</summary>
        <p>${esc(item.prompt)}</p><p>Your answer: ${esc(completed.responses[index].answer)}</p>
        <p><strong>Answer: ${esc(item.answer)}</strong> · ${esc(item.explanation)}</p>
      </details>`).join('')}
    </div>
  </section>`);
  find('#adv-results-map').onclick = () => map();
  find('#adv-results-progress').onclick = () => dashboard();
}

function dashboard(focus = true) {
  view = 'progress';
  const entries = evidence(history, level);
  const earned = badges(history).filter(badge => badge.earned);
  render(`<div class="adv-dashboard">
    <h1 tabindex="-1">Your progress</h1>
    <section class="adv-panel" aria-labelledby="adv-progress-heading">
      <h2 id="adv-progress-heading">Independent check-ins · ${esc(levelNames[level - 1])}</h2>
      <p>Each journey needs at least two completed, independent check-ins in different weeks and six puzzles at the same level before an accuracy percentage appears.</p>
      <p>These labels describe accuracy on these puzzles. Doing well means 80% or more, Developing means at least 50% and below 80%, and Needs more practice means below 50%.</p>
      <label>Progress level <select id="adv-progress-level">${levelNames.map((name, i) => `<option value="${i + 1}"${selected(i + 1, level)}>${esc(name)}</option>`).join('')}</select></label>
    </section>
    <section class="adv-evidence" aria-label="Journey progress">${entries.map(entry => {
      const area = areas.find(item => item.id === entry.area);
      const suggestion = suggestedLevel(history, entry.area, level);
      return `<article class="adv-panel">
        <h3>${journeys[entry.area].title}</h3>
        <p>${entry.sessions >= 2 && entry.total >= 6 && Number.isFinite(entry.pct) ?
          `<strong>${esc(entry.status)}</strong> · ${entry.pct}% correct (${entry.correct} of ${entry.total} puzzles)` : esc(entry.status)}</p>
        <p class="small">${entry.sessions} qualifying ${entry.sessions === 1 ? 'week' : 'weeks'} · ${entry.total} puzzles</p>
        <button class="secondary" data-practice="${entry.area}" data-level="${suggestion}">Practice at ${esc(levelNames[suggestion - 1])}</button>
        <div class="adv-tip"><strong>Try together</strong><p>${esc(area.parentTip)}</p></div>
      </article>`;
    }).join('')}</section>
    <section class="adv-panel"><h2>Badges</h2>
      ${earned.length ? `<ul class="adv-result-row">${earned.map(badge => `<li><strong>🏅 ${esc(badge.title)}</strong> · ${esc(badge.description)}</li>`).join('')}</ul>` :
        '<p>Finish an adventure to start earning badges.</p>'}
    </section>
    <section class="adv-panel">
      <h2>Saved adventures</h2>
      <p>${history.length} completed ${history.length === 1 ? 'adventure' : 'adventures'} for this learner. Progress stays in this browser.</p>
      <div class="actions"><button id="adv-dashboard-map" class="primary">Adventure map</button>
      ${history.length ? '<button id="adv-clear" class="secondary">Clear this learner’s history</button>' : ''}</div>
    </section>
  </div>`, focus);
  find('#adv-progress-level').onchange = event => {
    level = Number(event.target.value);
    saveSettings();
    dashboard(false);
    find('#adv-progress-level').focus();
  };
  main.querySelectorAll('[data-practice]').forEach(button => {
    button.onclick = () => {
      level = Number(button.dataset.level);
      saveSettings();
      lesson(button.dataset.practice);
    };
  });
  find('#adv-dashboard-map').onclick = () => map();
  find('#adv-clear')?.addEventListener('click', () => confirm(
    'Clear this learner’s history?',
    'This removes completed Reasoning Adventures for the current learner in this browser.',
    'Clear history', () => {
      if (!verifying) {
        const saved = write(storageKey(user?.id ?? null, slot), []);
        if (saved) history = [];
        dashboard();
      }
    }
  ));
}

function confirm(title, message, action, callback) {
  if (confirmBox.open) return;
  pending = callback;
  find('#adventure-confirm-title').textContent = title;
  find('#adventure-confirm-text').textContent = message;
  find('#adventure-confirm-action').textContent = action;
  confirmBox.showModal();
}

function discard() {
  clearTimeout(timer);
  session = null;
}

function navigate(callback) {
  if (!session) { callback(); return; }
  hideMemory(true);
  confirm('Leave this adventure?', 'You’ll lose this unfinished adventure.', 'Leave adventure', () => {
    discard();
    callback();
  });
}

find('#adventure-cancel').onclick = () => confirmBox.close();
confirmBox.addEventListener('close', () => { if (!confirmBox.open) pending = null; });
find('#adventure-confirm-action').onclick = () => {
  const callback = pending;
  pending = null;
  confirmBox.close();
  callback?.();
};

pageNav.onclick = () => navigate(() => map());
progressNav.onclick = () => navigate(() => dashboard());
find('#account-link').onclick = event => { event.preventDefault(); navigate(() => location.assign('/account.html')); };
find('header .brand').onclick = event => { event.preventDefault(); navigate(() => location.assign('/')); };
find('footer a[href="/kids.html"]').onclick = event => { event.preventDefault(); navigate(() => location.assign('/kids.html')); };
document.addEventListener('visibilitychange', () => { if (document.hidden) hideMemory(true); });
window.addEventListener('pagehide', () => hideMemory(true));
window.addEventListener('beforeunload', event => {
  if (session) {
    hideMemory(true);
    event.preventDefault();
    event.returnValue = '';
  }
});

async function refreshIdentity() {
  const revision = ++identityRevision;
  verifying = true;
  hideMemory(true);
  if (confirmBox.open) confirmBox.close();
  main.inert = true;
  main.setAttribute('aria-busy', 'true');
  pageNav.disabled = true;
  progressNav.disabled = true;
  let nextUser = null;
  try {
    nextUser = await service.user();
    progressKeys(nextUser?.id ?? null);
  } catch { nextUser = null; }
  if (revision !== identityRevision) return;
  verifying = false;
  main.inert = false;
  main.removeAttribute('aria-busy');
  pageNav.disabled = false;
  progressNav.disabled = false;
  if (user !== undefined && user?.id === nextUser?.id) return;
  discard();
  user = nextUser;
  const saved = read(settingsKey())?.slot;
  const preferred = read(progressKeys(user?.id ?? null).settings)?.profile;
  setLearner(slots.includes(saved) ? saved : slots.includes(preferred) ? preferred : 1);
  map(false);
}

onAccountChange(() => { setTimeout(() => void refreshIdentity(), 0); });
await refreshIdentity();
