import {progressKeys} from './auth-core.js';
import {badges, cleanHistory, periodKey, storageKey as adventureKey} from './adventure-engine.js';
import {lessons as frenchLessons} from './french-data.js';
import {cleanProgress as cleanFrench, frenchKey} from './french-engine.js';
import {cleanJourney} from './french-journey.js';
import {courses} from './indic-data.js';
import {reviewKey, reviewSummary} from './review-core.js';
import {cleanProgress as cleanIndic, slots, storageKey as indicKey} from './indic-engine.js';

function read(storage, key) {
  try {
    return JSON.parse(storage.getItem(key));
  } catch {
    return null;
  }
}

export function selectedLearner(storage, userId) {
  const slot = read(storage, progressKeys(userId).settings)?.profile;
  return slots.includes(slot) ? slot : 1;
}

export function saveSelectedLearner(storage, userId, slot) {
  if (!slots.includes(slot)) return false;
  const key = progressKeys(userId).settings;
  const saved = read(storage, key);
  const settings = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  try {
    storage.setItem(key, JSON.stringify({...settings, profile: slot}));
    return true;
  } catch {
    return false;
  }
}

function languageLink(path, slot) {
  return '/' + path + '.html?learner=' + slot;
}

export function readLearningToday(storage, userId, slot, now = Date.now()) {
  if (!slots.includes(slot)) throw Error('Invalid learner slot');
  const french = read(storage, frenchKey(userId, slot));
  const progress = cleanFrench(french, frenchLessons.map(lesson => lesson.id));
  const journey = cleanJourney(french?.journey, frenchLessons);
  const languages = [{
    id: 'fr', name: 'French', native: 'Bonjour !', href: languageLink('french', slot),
    completed: Object.keys(progress.lessons).length, total: frenchLessons.length,
    inProgress: Boolean(journey.draft),
    started: Boolean(journey.draft || progress.history.length ||
      Object.keys(progress.lessons).length || Object.keys(journey.flashcards).length ||
      Object.keys(journey.missions).length),
  }, ...['ta', 'kn'].map(id => {
    const course = courses[id];
    const saved = cleanIndic(course, read(storage, indicKey(id, userId, slot)));
    const completed = Object.keys(saved.completed).length;
    return {
      id, name: course.name, native: course.native, href: languageLink(course.name.toLowerCase(), slot),
      completed, total: course.lessons.length, inProgress: Boolean(saved.activity),
      started: Boolean(saved.activity || completed),
    };
  })].map(course => ({
    ...course,
    reviewHref: '/review.html?lang=' + course.id + '&learner=' + slot,
    review: reviewSummary(read(storage, reviewKey(userId, course.id, slot)), course.id, now),
  }));
  const history = cleanHistory(read(storage, adventureKey(userId, slot)));
  const completedAdventures = history.filter(record => record.complete);
  const today = periodKey('daily', new Date(now));
  const dailyComplete = completedAdventures.some(record => record.mode === 'daily' && record.period === today);
  const reasoningHref = languageLink('adventures', slot);
  const activityCount = languages.reduce((sum, course) => sum + course.completed, completedAdventures.length);
  const garden = [1, 5, 10].map(goal => ({goal, grown: activityCount >= goal}));
  return {
    languages, garden, activityCount, reasoningHref, dailyComplete,
    completedAdventures: completedAdventures.length,
    earnedBadges: badges(history).filter(badge => badge.earned).length,
    next: nextAction(languages, history, reasoningHref, dailyComplete),
  };
}

function nextAction(languages, history, reasoningHref, dailyComplete) {
  const due = languages.find(item => item.review.dueCount && item.review.readyCount);
  if (due) return {
    title: 'Review ' + due.name + ' words',
    detail: 'Recall a few words you have already practised.',
    href: due.reviewHref, label: 'Review ' + due.name,
  };
  const course = languages.find(item => item.inProgress) ||
    languages.find(item => item.started && item.completed < item.total);
  if (course) return {
    title: 'Continue ' + course.name,
    detail: course.inProgress ? 'A saved activity is waiting in your course.' : 'Open your course to choose the next lesson.',
    href: course.href, label: 'Open ' + course.name,
  };
  if (languages.some(item => item.started) || history.length) return {
    title: dailyComplete ? 'Explore another puzzle' : 'Try today’s Daily Trail',
    detail: 'Visit the reasoning map to choose a puzzle or try a different skill.',
    href: reasoningHref, label: 'Open the reasoning map',
  };
  return {
    title: 'Say your first hello',
    detail: 'Pick French, Tamil or Kannada and try a few words with pictures.',
    href: '/#languages', label: 'Find a language',
  };
}
