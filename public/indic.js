import {service, onAccountChange} from './auth-client.js';
import {progressKeys} from './auth-core.js';
import {readProfiles} from './child-profiles.js';
import {showChildHeader} from './child-profile-ui.js';
import {courses} from './indic-data.js';
import {PASS, slots, blankProgress, storageKey, quizOptions, quizScore, readProgress, writeProgress} from './indic-engine.js';

const language = document.documentElement.dataset.course;
const course = courses[language];
const find = selector => document.querySelector(selector);
const app = find('#indic');
const exit = find('#exit');
const saveStatus = find('#save-status');
const audioStatus = find('#audio-status');
const audioStop = find('#stop-audio');
const audio = window.speechSynthesis;
const esc = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const modes = {cards: 'Flashcards', quiz: 'Quiz', dialogue: 'Dialogue'};
const stages = {1: 'First words', 2: 'Everyday life', 3: 'Putting it together'};
let user;
let slot = 1;
let key;
let progress;
let viewing = false;
let storageOK = true;
let pending;
let speech;
let identityRevision = 0;
const unsaved = new Map();

function showAudioStatus() {
  if (!speech) {
    audioStatus.textContent = getVoice() ? `Listen uses a ${course.name} voice on this device.`
      : `No ${course.name} voice is available on this device. You can still read and practice.`;
  }
}

function getVoice() {
  return audio?.getVoices().find(voice => voice.lang.toLowerCase().replaceAll('_', '-').split('-')[0] === language);
}

function stopAudio() {
  if (speech) {
    speech = null;
    audio.cancel();
  }
  audioStop.disabled = true;
  showAudioStatus();
}

function listen(text) {
  stopAudio();
  const voice = getVoice();
  if (!voice || !window.SpeechSynthesisUtterance) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.85;
  utterance.onstart = () => {
    if (speech === utterance) audioStatus.textContent = `Playing ${course.name} audio…`;
  };
  utterance.onend = () => {
    if (speech !== utterance) return;
    speech = null;
    stopAudio();
  };
  utterance.onerror = () => {
    if (speech !== utterance) return;
    speech = null;
    audioStop.disabled = true;
    audioStatus.textContent = `${course.name} audio could not play. Try Listen again.`;
  };
  speech = utterance;
  audioStop.disabled = false;
  audioStatus.textContent = 'Preparing audio…';
  try {
    audio.speak(utterance);
  } catch {
    utterance.onerror();
  }
}

audio?.addEventListener('voiceschanged', showAudioStatus);
audioStop.onclick = stopAudio;
window.addEventListener('pagehide', stopAudio);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAudio();
});

function updateSaveStatus() {
  saveStatus.textContent = storageOK
    ? 'Progress stays in this browser for this course and learner. It does not sync across devices.'
    : 'Progress could not be saved in this browser. Keep this page open to keep your place.';
}

function save() {
  try {
    writeProgress(localStorage, key, course, progress);
    storageOK = true;
    unsaved.delete(key);
  } catch {
    storageOK = false;
    unsaved.set(key, progress);
  }
  updateSaveStatus();
}

function load() {
  key = storageKey(language, user?.id ?? null, slot);
  try {
    progress = unsaved.get(key) || readProgress(localStorage, key, course);
    storageOK = !unsaved.has(key);
  } catch {
    progress = blankProgress();
    storageOK = false;
  }
  updateSaveStatus();
}

function navigate(action) {
  if (!viewing || !progress.activity) {
    stopAudio();
    action();
    return;
  }
  save();
  confirmAction(action, {
    title: 'Pause this activity?',
    description: storageOK
      ? 'You can pick up where you left off from the lesson path.'
      : 'This browser could not save your place. Leaving or reloading the page may lose your progress.',
    label: 'Pause and leave'
  });
}

function confirmAction(action, {title, description, label}) {
  if (exit.open) return;
  pending = action;
  find('#exit-title').textContent = title;
  find('#exit-description').textContent = description;
  find('#leave').textContent = label;
  exit.showModal();
}

find('#stay').onclick = () => exit.close();
find('#leave').onclick = () => {
  const action = pending;
  exit.close();
  stopAudio();
  action?.();
};
exit.addEventListener('close', () => {
  if (!exit.open) pending = null;
});
window.addEventListener('beforeunload', event => {
  if (unsaved.size) {
    event.preventDefault();
    event.returnValue = '';
  }
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (event.defaultPrevented || !viewing || !link || link.getAttribute('href').startsWith('#') ||
      event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(() => location.assign(link.href));
});

function activateLearner(nextSlot) {
  slot = nextSlot;
  if (user) {
    try {
      const settingsKey = progressKeys(user.id).settings;
      let settings;
      try {
        settings = JSON.parse(localStorage.getItem(settingsKey));
      } catch {
        settings = {};
      }
      localStorage.setItem(settingsKey, JSON.stringify({...settings, profile: slot}));
    } catch {
      // Learner switching still works for this page.
    }
  }
  load();
  showHeader();
  path();
}

function showHeader() {
  showChildHeader(user, slot, navigate, service);
  find('.indic-status').after(find('#theme-dock'));
  find('#account-link').textContent = user ? 'Adult account' : 'Adult sign in';
}

function render(html, {scroll = true, focus = true} = {}) {
  app.innerHTML = html;
  const heading = app.querySelector('h1');
  if (focus) heading.focus({preventScroll: true});
  if (scroll) window.scrollTo(0, 0);
}

function completedCount(lessons) {
  return lessons.filter(lesson => Object.hasOwn(progress.completed, lesson.id)).length;
}

function path({focus = true} = {}) {
  stopAudio();
  viewing = false;
  const completed = completedCount(course.lessons);
  const active = course.lessons.find(lesson => lesson.id === progress.activity?.lesson);
  const nextLesson = course.lessons.find(lesson => !Object.hasOwn(progress.completed, lesson.id)) || course.lessons[0];
  const stageGroups = new Map();
  for (const lesson of course.lessons) {
    if (!stageGroups.has(lesson.stage)) stageGroups.set(lesson.stage, []);
    stageGroups.get(lesson.stage).push(lesson);
  }
  const profiles = user ? readProfiles(user.id) : {};
  render(`
    <section class="indic-hero">
      <div>
        <h1 tabindex="-1">Learn ${esc(course.name)}</h1>
        <p>Practice everyday words and short conversations, one lesson at a time.</p>
        <div class="actions">
          ${active ? `<button class="primary" id="resume">Resume ${esc(modes[progress.activity.mode].toLowerCase())} · ${esc(active.title)}</button>`
            : `<button class="primary" data-lesson="${esc(nextLesson.id)}">${completed === 0 ? 'Open first lesson' : `Open lesson · ${esc(nextLesson.title)}`}</button>`}
        </div>
      </div>
      <p class="course-script" lang="${language}">${esc(course.native)}</p>
    </section>
    <section class="indic-progress" aria-label="Course progress">
      <div>
        <strong>${completed} of ${course.lessons.length} lessons complete</strong>
        <progress aria-label="Lessons complete" value="${completed}" max="${course.lessons.length}"></progress>
      </div>
      ${user ? `<label for="learner-slot">Learner <select id="learner-slot">
        ${slots.map(n => `<option value="${n}" ${n === slot ? 'selected' : ''}>${esc(profiles[n]?.name || `Learner ${n}`)}</option>`).join('')}
      </select></label>` : '<p>Guest practice</p>'}
    </section>
    <div class="indic-stages">
      ${Array.from(stageGroups, ([stage, lessons]) => {
        const done = completedCount(lessons);
        return `<section class="indic-stage">
          <div class="stage-heading"><h2>Stage ${esc(stage)} · ${esc(stages[stage])}</h2>
            <span>${done === lessons.length ? '🏅 Badge earned' : `${done} of ${lessons.length} complete`}</span>
          </div>
          <ul>${lessons.map(lesson => `<li>
            <button type="button" class="lesson-row" data-lesson="${esc(lesson.id)}">
              <span class="lesson-icon" aria-hidden="true">${esc(lesson.icon)}</span>
              <span>${esc(lesson.title)}
              ${Object.hasOwn(progress.completed, lesson.id) ? `<small>Complete · Best quiz ${progress.completed[lesson.id]}%</small>` : ''}</span>
              <span aria-hidden="true">›</span>
            </button></li>`).join('')}</ul>
        </section>`;
      }).join('')}
    </div>`, {focus});
  find('#resume')?.addEventListener('click', () => activity(active));
  app.querySelectorAll('[data-lesson]').forEach(button => {
    button.onclick = () => lessonMenu(course.lessons.find(lesson => lesson.id === button.dataset.lesson));
  });
  const selector = find('#learner-slot');
  if (selector) selector.onchange = () => activateLearner(Number(selector.value));
}

function lessonMenu(lesson) {
  viewing = false;
  render(`
    <button class="text-btn" id="back-path">← Lesson path</button>
    <section class="indic-panel">
      <h1 tabindex="-1">${esc(lesson.title)}</h1>
      <div class="mode-grid">
        ${Object.entries(modes).map(([mode, label]) => {
          const resume = progress.activity?.lesson === lesson.id && progress.activity.mode === mode;
          const descriptions = {cards: 'Read words with their meanings.', quiz: `Score ${PASS}% or higher to complete the lesson.`, dialogue: 'Read a short conversation one line at a time.'};
          return `<button class="mode-button" type="button" data-mode="${mode}">
            <strong>${resume ? 'Resume ' : ''}${label}</strong><span>${descriptions[mode]}</span>
          </button>`;
        }).join('')}
      </div>
    </section>`);
  find('#back-path').onclick = () => path();
  app.querySelectorAll('[data-mode]').forEach(button => {
    button.onclick = () => start(lesson, button.dataset.mode);
  });
}

function start(lesson, mode) {
  if (progress.activity?.lesson === lesson.id && progress.activity.mode === mode) {
    activity(lesson);
    return;
  }
  const begin = () => {
    progress.activity = {lesson: lesson.id, mode, index: 0};
    if (mode === 'quiz') progress.activity.answers = lesson.words.map(() => null);
    save();
    activity(lesson);
  };
  if (progress.activity) {
    confirmAction(begin, {
      title: 'Start a different activity?',
      description: 'Your new activity will replace the paused activity. Completed lessons and badges stay saved.',
      label: 'Start new activity'
    });
  } else begin();
}

function activity(lesson, {advance = false} = {}) {
  stopAudio();
  viewing = true;
  const current = progress.activity;
  const {mode, index} = current;
  const items = mode === 'dialogue' ? lesson.dialogue : lesson.words;
  const item = items[index];
  const last = index + 1 === items.length;
  const quiz = mode === 'quiz';
  const answered = quiz && current.answers[index] !== null;
  render(`
    <button class="text-btn" id="back-lesson">← Lesson activities</button>
    <section class="indic-panel indic-activity">
      <div class="activity-top">
        <p>${esc(lesson.title)}</p><span>${index + 1} of ${items.length}</span>
      </div>
      <h1 tabindex="-1">${modes[mode]}</h1>
      ${quiz ? '<p>Choose the English meaning.</p>' : ''}
      <figure class="indic-word">
        ${!quiz && item.icon ? `<span class="word-icon" aria-hidden="true">${esc(item.icon)}</span>` : ''}
        <p class="word-script" lang="${language}">${esc(item.text)}</p>
        <p class="word-roman">${esc(item.roman)}</p>
        ${quiz ? '' : `<figcaption>${esc(item.meaning)}</figcaption>`}
      </figure>
      <button class="secondary" id="listen" aria-describedby="audio-status">Listen</button>
      ${quiz ? `<div class="quiz-options" role="group" aria-label="English meanings">
        ${quizOptions(lesson, index).map(option => `<button class="secondary quiz-option"
          type="button" data-answer="${option}" aria-pressed="${current.answers[index] === option}"
          ${answered ? 'disabled' : ''}>${esc(lesson.words[option].meaning)}</button>`).join('')}
      </div><p class="quiz-feedback" id="quiz-feedback" role="status">${answered ? esc(feedback(lesson, current)) : ''}</p>` : ''}
      <div class="activity-actions">
        ${!quiz ? `<button class="secondary" id="previous" ${index === 0 ? 'disabled' : ''}>Previous</button>` : ''}
        <button class="primary" id="next" ${quiz && !answered ? 'disabled' : ''}>${last ? (quiz ? 'See score' : 'Finish') : 'Next'}</button>
      </div>
    </section>`, {focus: !advance, scroll: !advance});
  if (advance) find('.word-script').setAttribute('tabindex', '-1');
  if (advance) find('.word-script').focus();
  find('#back-lesson').onclick = () => navigate(() => lessonMenu(lesson));
  find('#listen').onclick = () => listen(item.text);
  app.querySelectorAll('[data-answer]').forEach(button => {
    button.onclick = () => {
      if (current.answers[index] !== null) return;
      const answer = Number(button.dataset.answer);
      current.answers[index] = answer;
      save();
      app.querySelectorAll('[data-answer]').forEach(choice => {
        choice.disabled = true;
        choice.setAttribute('aria-pressed', String(Number(choice.dataset.answer) === answer));
      });
      find('#quiz-feedback').textContent = feedback(lesson, current);
      find('#next').disabled = false;
      find('#next').focus();
    };
  });
  const previous = find('#previous');
  if (previous) previous.onclick = () => {
    current.index -= 1;
    save();
    activity(lesson, {advance: true});
  };
  find('#next').onclick = () => {
    if (quiz && current.answers[index] === null) return;
    if (last) finish(lesson, mode);
    else {
      current.index += 1;
      save();
      activity(lesson, {advance: true});
    }
  };
}

function feedback(lesson, {answers, index}) {
  return answers[index] === index ? 'Correct!'
    : `The meaning is “${lesson.words[index].meaning}”.`;
}

function finish(lesson, mode) {
  stopAudio();
  viewing = false;
  const quiz = mode === 'quiz';
  const score = quiz ? quizScore(progress.activity.answers) : null;
  if (score !== null && score >= PASS) {
    progress.completed[lesson.id] = Math.max(progress.completed[lesson.id] || 0, score);
  }
  progress.activity = null;
  save();
  const stageLessons = course.lessons.filter(item => item.stage === lesson.stage);
  const badge = mode === 'quiz' && score >= PASS && completedCount(stageLessons) === stageLessons.length;
  render(`<section class="indic-panel">
    <h1 tabindex="-1">${quiz ? `Quiz score · ${score}%` : `${modes[mode]} finished`}</h1>
    ${quiz ? `<p>${score >= PASS ? 'Lesson complete!' : `Score ${PASS}% or higher to complete the lesson. You can try again.`}</p>`
      : '<p>Take the lesson quiz to earn credit toward your stage badge.</p>'}
    ${badge ? `<p class="earned-badge">🏅 ${esc(stages[lesson.stage])} badge earned</p>` : ''}
    <div class="actions">
      <button class="primary" id="result-activity">${quiz ? 'Retake quiz' : 'Take quiz'}</button>
      <button class="secondary" id="result-path">Lesson path</button>
    </div>
  </section>`);
  find('#result-activity').onclick = () => start(lesson, 'quiz');
  find('#result-path').onclick = () => path();
}

find('#course-path').onclick = () => navigate(() => path());
async function refreshIdentity() {
  const revision = ++identityRevision;
  let nextUser = null;
  try {
    nextUser = await service.user();
    progressKeys(nextUser?.id ?? null);
  } catch {
    nextUser = null;
  }
  if (revision !== identityRevision || user !== undefined && user?.id === nextUser?.id) return;
  stopAudio();
  if (exit.open) exit.close();
  pending = null;
  user = nextUser;
  slot = 1;
  if (user) {
    try {
      const preferred = JSON.parse(localStorage.getItem(progressKeys(user.id).settings))?.profile;
      if (slots.includes(preferred)) slot = preferred;
    } catch {
      // Use the first learner when saved settings cannot be read.
    }
  }
  load();
  showHeader();
  path({focus: false});
  find('#course-path').disabled = false;
}

showAudioStatus();
onAccountChange(() => {
  // Let the auth callback return before calling the service again.
  setTimeout(() => { void refreshIdentity(); }, 0);
});
await refreshIdentity();



