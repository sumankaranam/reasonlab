import {service, onAccountChange} from './auth-client.js';
import {progressKeys} from './auth-core.js';
import {readProfiles} from './child-profiles.js';
import {showChildHeader} from './child-profile-ui.js';
import {lessons} from './french-data.js';
import {cleanProgress as cleanFrench, frenchKey} from './french-engine.js';
import {wordPicture} from './french-pictures.js';
import {courses} from './indic-data.js';
import {cleanProgress as cleanIndic, storageKey as indicKey} from './indic-engine.js';
import {reviewLanguages, reviewKey, cleanReview, dueCards, recordReview, reviewSummary} from './review-core.js';

const find = selector => document.querySelector(selector);
const deck = find('#review-deck');
const identity = find('#review-identity');
const save = find('#review-save');
const languageSelect = find('#review-language');
const learnerSelect = find('#review-learner');
const languageInfo = {
  fr: {name: 'French', locale: 'fr-FR', page: 'french'},
  ta: {...courses.ta, page: 'tamil'},
  kn: {...courses.kn, page: 'kannada'},
};
const params = new URLSearchParams(location.search);
const slots = [1, 2, 3];
const requestedSlot = /^[123]$/.test(params.get('learner')) ? Number(params.get('learner')) : null;
let language = reviewLanguages.includes(params.get('lang')) ? params.get('lang') : 'fr';
let slot = 1;
let user;
let identityRevision = 0;
let ready = false;
let warning = '';
let state;
let completedLessons = [];
let revealed = false;
let card;
let utterance;
const unsaved = new Map();

function escape(value) {
  const node = document.createElement('span');
  node.textContent = value ?? '';
  return node.innerHTML;
}

function stopAudio() {
  if (utterance) {
    utterance = null;
    window.speechSynthesis?.cancel();
  }
}

function listen() {
  const status = find('#review-audio');
  const {name, locale} = languageInfo[language];
  const unavailable = 'A ' + name + ' voice is unavailable on this device. You can keep reading the card.';
  try {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      status.textContent = unavailable;
      return;
    }
    const voices = speechSynthesis.getVoices();
    const match = voices.find(voice => voice.lang.toLowerCase() === locale.toLowerCase()) ??
      voices.find(voice => voice.lang.toLowerCase().split(/[-_]/)[0] === language);
    if (!match) {
      status.textContent = unavailable;
      return;
    }
    stopAudio();
    const speech = new SpeechSynthesisUtterance(card.text);
    speech.lang = match.lang;
    speech.voice = match;
    speech.rate = 0.85;
    speech.onend = () => {
      if (utterance !== speech) return;
      utterance = null;
      status.textContent = '';
    };
    speech.onerror = () => {
      if (utterance !== speech) return;
      utterance = null;
      status.textContent = 'Could not play this word. You can keep reading the card.';
    };
    utterance = speech;
    status.textContent = 'Playing the ' + name + ' word…';
    speechSynthesis.speak(speech);
  } catch {
    status.textContent = unavailable;
  }
}

function key() {
  return reviewKey(user?.id ?? null, language, slot);
}

function read(keyToRead) {
  return JSON.parse(localStorage.getItem(keyToRead));
}

function load() {
  stopAudio();
  revealed = false;
  completedLessons = [];
  try {
    state = cleanReview(read(key()), language);
    save.textContent = 'Review progress is saved on this device.';
  } catch {
    state = cleanReview(null, language);
    save.textContent = 'Could not read saved progress on this device.';
  }
  if (unsaved.has(key())) {
    state = unsaved.get(key());
    save.textContent = 'Could not save on this device. Recent reviews are held in this open page.';
  }
  const id = user?.id ?? null;
  try {
    completedLessons = language === 'fr'
      ? Object.keys(cleanFrench(read(frenchKey(id, slot)), lessons.map(lesson => lesson.id)).lessons)
      : Object.keys(cleanIndic(courses[language], read(indicKey(language, id, slot))).completed);
  } catch {
    // The deck can start with course words even when lesson progress is unavailable.
  }
  render();
}

function render(focus = false) {
  const now = Date.now();
  const summary = reviewSummary(state, language, now);
  const words = dueCards(state, language, now, 5, completedLessons);
  card = words[0];
  const total = summary.reviewedToday + words.length;
  const meta = summary.dueCount === 1 ? '1 word due' : summary.dueCount + ' words due';
  if (!card) {
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const next = summary.dueCount ? tomorrow.getTime() : summary.nextDue;
    const formatted = next ? new Intl.DateTimeFormat(undefined, {weekday: 'long', month: 'long', day: 'numeric'}).format(next) : '';
    deck.innerHTML = '<p class="review-meta">' + meta + '</p><h2 id="review-focus" tabindex="-1">You’re done for today!</h2>' +
      (summary.reviewedToday ? '<p>' + summary.reviewedToday + (summary.reviewedToday === 1 ? ' word' : ' words') + ' reviewed today.</p>' : '') +
      (formatted ? '<p>Next review ' + escape(formatted) + '.</p>' : '') +
      '<div class="actions"><a class="secondary" href="' + find('#course-link').getAttribute('href') + '">Back to the course</a></div>';
  } else {
    const art = language === 'fr' ? wordPicture(card.text, card.meaning, card.lessonId) : escape(card.icon ?? '📚');
    deck.innerHTML = '<p class="review-meta">Card ' + (summary.reviewedToday + 1) + ' of ' + total + ' · ' + meta + '</p>' +
      '<h2 id="review-focus" class="review-word" tabindex="-1" lang="' + language + '">' + escape(card.text) + '</h2>' +
      (card.roman ? '<p>' + escape(card.roman) + '</p>' : '') +
      '<button class="secondary" id="review-listen" type="button">Listen</button><p id="review-audio" role="status"></p>' +
      (revealed
        ? '<div class="review-meaning"><div class="review-art" aria-hidden="true">' + art + '</div><h3 id="review-meaning" tabindex="-1">' +
          escape(card.meaning) + '</h3></div><p>Did you remember the meaning before you looked?</p>' +
          '<div class="actions"><button class="secondary" type="button" data-rating="again">Still learning</button>' +
          '<button class="primary" type="button" data-rating="good">Remembered</button></div>'
        : '<p>Think of what it means, then check.</p><button class="primary" id="review-reveal" type="button">Reveal English</button>');
  }
  deck.hidden = false;
  if (focus) find(revealed && card ? '#review-meaning' : '#review-focus').focus();
}

function rate(rating) {
  if (!ready || !revealed || !card) return;
  stopAudio();
  let latest = state;
  const scope = key();
  try {
    const saved = cleanReview(read(scope), language);
    for (const [id, item] of Object.entries(state.cards)) {
      if (!saved.cards[id] || item.lastReviewed > saved.cards[id].lastReviewed) saved.cards[id] = item;
    }
    latest = saved;
  } catch {
    // A failed read may be temporary. Try to save the in-memory state.
  }
  state = recordReview(latest, language, card.id, rating);
  try {
    localStorage.setItem(scope, JSON.stringify(state));
    unsaved.delete(scope);
    save.textContent = 'Review progress saved on this device.';
  } catch {
    unsaved.set(scope, state);
    save.textContent = 'Could not save on this device. Recent reviews are held in this open page.';
  }
  revealed = false;
  render(true);
}

function showScope() {
  languageSelect.value = language;
  learnerSelect.value = slot;
  const course = languageInfo[language];
  const link = find('#course-link');
  link.href = '/' + course.page + '.html?learner=' + slot;
  link.textContent = course.name + ' course';
  link.hidden = false;
  showChildHeader(user, slot, action => { stopAudio(); action(); }, service);
  find('#review').after(find('#theme-dock'));
  identity.textContent = warning || (user ? 'Adult account' : 'Guest') + ' · Learner ' + slot;
  load();
}

function changeScope() {
  if (!ready) return;
  language = languageSelect.value;
  slot = Number(learnerSelect.value);
  const url = new URL(location.href);
  url.searchParams.set('lang', language);
  url.searchParams.set('learner', slot);
  history.replaceState(null, '', url);
  showScope();
}

async function refreshIdentity() {
  const revision = ++identityRevision;
  let next = null;
  let message = '';
  ready = false;
  stopAudio();
  deck.hidden = true;
  const banner = find('#child-banner');
  if (banner) banner.hidden = true;
  find('#course-link').hidden = true;
  save.textContent = '';
  find('#review-controls').hidden = true;
  identity.textContent = 'Checking your review account…';
  try {
    next = await service.user();
    progressKeys(next?.id ?? null);
  } catch {
    next = null;
    message = 'Your adult account could not be verified. You’re reviewing as a guest.';
  }
  if (revision !== identityRevision) return;
  if (user === undefined || user?.id !== next?.id) {
    unsaved.clear();
    slot = requestedSlot ?? 1;
    if (!requestedSlot) {
      try {
        const preferred = read(progressKeys(next?.id ?? null).settings)?.profile;
        if (slots.includes(preferred)) slot = preferred;
      } catch {
        // Start with learner one when the preferred slot is unavailable.
      }
    }
  }
  user = next;
  warning = message;
  const profiles = readProfiles(user?.id ?? null);
  learnerSelect.replaceChildren(...slots.map(value => new Option(profiles[value]?.name ?? 'Learner ' + value, value)));
  find('#account-link').textContent = user ? 'My account' : 'Adult sign in';
  ready = true;
  find('#review-controls').hidden = false;
  showScope();
}

languageSelect.replaceChildren(...reviewLanguages.map(id => new Option(languageInfo[id].name, id)));
languageSelect.addEventListener('change', changeScope);
learnerSelect.addEventListener('change', changeScope);
deck.addEventListener('click', event => {
  if (!ready || !card) return;
  const button = event.target.closest('button');
  if (button?.id === 'review-listen') listen();
  if (button?.id === 'review-reveal') {
    stopAudio();
    revealed = true;
    render(true);
  }
  if (button?.dataset.rating) rate(button.dataset.rating);
});
addEventListener('pagehide', stopAudio);
onAccountChange(event => {
  if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
  ready = false;
  setTimeout(() => { void refreshIdentity(); }, 0);
});
await refreshIdentity();
