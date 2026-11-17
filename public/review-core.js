import {progressKeys} from './auth-core.js';
import {lessons} from './french-data.js';
import {courses} from './indic-data.js';

const DAY = 86_400_000;
const MAX_DATE = 8_640_000_000_000_000;
const MAX_REVIEWS = 1_000_000;
const intervals = [1, 3, 7, 14, 30];
export const reviewLanguages = Object.freeze(['fr', 'ta', 'kn']);

const courseLessons = {
  fr: [...lessons.filter(lesson => lesson.id === 'sound-hello'), ...lessons.filter(lesson => lesson.id !== 'sound-hello')],
  ta: courses.ta.lessons,
  kn: courses.kn.lessons,
};

const catalogs = Object.fromEntries(reviewLanguages.map(language => [
  language,
  Object.freeze(courseLessons[language].flatMap(lesson => lesson.words.map((word, index) =>
    Object.freeze({
      id: language + ':' + lesson.id + ':' + index,
      text: word.fr ?? word.text,
      roman: word.roman,
      meaning: word.en ?? word.meaning,
      icon: word.icon,
      lessonId: lesson.id,
    })))),
]));

export function catalog(language) {
  return reviewLanguages.includes(language) ? catalogs[language] : [];
}

export function reviewKey(userId, language, slot) {
  if (!reviewLanguages.includes(language) || ![1, 2, 3].includes(slot)) throw Error('Invalid review scope');
  return progressKeys(userId).settings + ':review:' + language + ':' + slot;
}

const boundedInteger = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const day = time => new Date(time).toDateString();

export function cleanReview(raw, language) {
  const cards = {};
  if (raw?.version !== 1 || !raw.cards || typeof raw.cards !== 'object' || Array.isArray(raw.cards)) {
    return {version: 1, cards};
  }
  const allowed = language === undefined ? reviewLanguages.flatMap(catalog) : catalog(language);
  for (const {id} of allowed) {
    if (!Object.hasOwn(raw.cards, id)) continue;
    const value = raw.cards[id];
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const {due, interval, lapses, reviews, lastReviewed} = value;
    if (!intervals.includes(interval) || !boundedInteger(lastReviewed, 0, MAX_DATE - 30 * DAY) ||
        due !== lastReviewed + interval * DAY || !boundedInteger(reviews, 1, MAX_REVIEWS) ||
        !boundedInteger(lapses, 0, reviews)) continue;
    cards[id] = {due, interval, lapses, reviews, lastReviewed};
  }
  return {version: 1, cards};
}

function queue(state, language, now) {
  const words = catalog(language);
  const {cards} = cleanReview(state, language);
  const reviewedToday = Object.values(cards).filter(card => day(card.lastReviewed) === day(now));
  const due = words.filter(({id}) => cards[id]?.due <= now && day(cards[id].lastReviewed) !== day(now))
    .sort((a, b) => cards[a.id].due - cards[b.id].due);
  const upcoming = Object.values(cards).filter(card => card.due > now).map(card => card.due);
  return {words, cards, due, reviewedToday, nextDue: upcoming.length ? Math.min(...upcoming) : null};
}

export function dueCards(state, language, now = Date.now(), limit = 5, completedLessons = []) {
  const {words, cards, due, reviewedToday} = queue(state, language, now);
  const remaining = Math.min(5, Number.isInteger(limit) ? limit : 5, 5 - reviewedToday.length);
  if (remaining <= 0) return [];
  if (due.length) return due.slice(0, remaining);
  if (reviewedToday.some(card => card.reviews > 1)) return [];
  const completed = new Set(completedLessons);
  return words.filter(({id}) => !cards[id])
    .sort((a, b) => Number(completed.has(b.lessonId)) - Number(completed.has(a.lessonId)))
    .slice(0, remaining);
}

export function reviewSummary(state, language, now = Date.now()) {
  const {due, nextDue, reviewedToday} = queue(state, language, now);
  return {dueCount: due.length, readyCount: dueCards(state, language, now).length,
    nextDue, reviewedToday: reviewedToday.length};
}

export function recordReview(state, language, id, rating, now = Date.now()) {
  const clean = cleanReview(state, language);
  if (!catalog(language).some(card => card.id === id) || !['again', 'good'].includes(rating) ||
      !boundedInteger(now, 0, MAX_DATE - 30 * DAY)) return clean;
  const previous = clean.cards[id];
  if (previous && (now < previous.due || day(now) === day(previous.lastReviewed))) return clean;
  if (reviewSummary(clean, language, now).reviewedToday >= 5) return clean;
  const interval = rating === 'again' ? 1 : intervals[Math.min(intervals.indexOf(previous?.interval) + 1, 4)];
  clean.cards[id] = {due: now + interval * DAY, interval, lapses: Math.min(MAX_REVIEWS, (previous?.lapses ?? 0) +
    Number(rating === 'again')), reviews: Math.min(MAX_REVIEWS, (previous?.reviews ?? 0) + 1), lastReviewed: now};
  return clean;
}
