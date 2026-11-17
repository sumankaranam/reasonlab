import assert from 'node:assert/strict';
import test from 'node:test';
import {progressKeys} from '../public/auth-core.js';
import {makeSession, periodKey, storageKey as adventureKey, summarize} from '../public/adventure-engine.js';
import {frenchKey} from '../public/french-engine.js';
import {storageKey as indicKey} from '../public/indic-engine.js';
import {catalog, recordReview, reviewKey} from '../public/review-core.js';
import {readLearningToday, saveSelectedLearner, selectedLearner} from '../public/today-core.js';

const adult = '11111111-1111-4111-8111-111111111111';
const now = Date.UTC(2026, 5, 10, 12);
const day = 86_400_000;

function storage() {
  const entries = new Map();
  return {
    setItem: (key, value) => entries.set(key, value),
    getItem: key => entries.get(key) ?? null,
    put: (key, value) => entries.set(key, JSON.stringify(value)),
    entries,
  };
}

test('Today tolerates unreadable and corrupt storage and suggests a first activity', () => {
  const blocked = {
    getItem() { throw Error('blocked'); },
    setItem() { throw Error('blocked'); },
  };
  assert.equal(selectedLearner(blocked, null), 1);
  assert.equal(saveSelectedLearner(blocked, null, 2), false);
  const local = storage();
  local.setItem(frenchKey(null, 1), '{broken');
  local.setItem(reviewKey(null, 'fr', 1), 'NaN');
  local.put(indicKey('ta', null, 1), {version: 1, completed: {'ta-hello': 99}});
  local.put(adventureKey(null, 1), [{complete: true, id: 'fake'}]);
  for (const source of [blocked, local]) {
    const summary = readLearningToday(source, null, 1, now);
    assert.deepEqual(summary.languages.map(course => course.completed), [0, 0, 0]);
    assert.equal(summary.earnedBadges, 0);
    assert.equal(summary.activityCount, 0);
    assert.equal(summary.next.href, '/#languages');
  }
});

test('Today preserves shared settings and isolates account and guest learner records', () => {
  const local = storage();
  local.put(progressKeys(null).settings, {profile: 1, grade: 5, theme: 'unicorn'});
  assert.equal(saveSelectedLearner(local, null, 3), true);
  assert.equal(saveSelectedLearner(local, adult, 2), true);
  assert.equal(saveSelectedLearner(local, adult, 4), false);
  assert.deepEqual(JSON.parse(local.getItem(progressKeys(null).settings)), {profile: 3, grade: 5, theme: 'unicorn'});
  assert.equal(selectedLearner(local, null), 3);
  assert.equal(selectedLearner(local, adult), 2);
  local.put(indicKey('ta', null, 3), {version: 1, completed: {'ta-hello': 100}});
  local.put(indicKey('kn', adult, 2), {version: 1, activity: {lesson: 'kn-hello', mode: 'cards', index: 0}});
  const before = [...local.entries];
  const guest = readLearningToday(local, null, 3, now);
  assert.equal(guest.next.href, '/tamil.html?learner=3');
  assert.equal(guest.activityCount, 1);
  assert.deepEqual(guest.garden.map(plant => plant.grown), [true, false, false]);
  const account = readLearningToday(local, adult, 2, now);
  assert.equal(account.activityCount, 0);
  assert.equal(account.next.href, '/kannada.html?learner=2');
  assert.equal(readLearningToday(local, adult, 3, now).next.href, '/#languages');
  assert.equal(readLearningToday(local, null, 2, now).next.href, '/#languages');
  assert.deepEqual([...local.entries], before);
});

test('Today counts validated lessons and completed adventures, reads earned badges and links due review', () => {
  const local = storage();
  const lesson = {best: 90, latest: 90, attempts: 1, stars: 3, date: now, due: now + day, box: 0};
  local.put(frenchKey(null, 1), {version: 1, lessons: {'sound-hello': lesson, unknown: lesson}});
  const mode = 'daily', level = 1, area = 'all', date = new Date(now);
  const period = periodKey(mode, date);
  const questions = makeSession({seed: 5, mode, area, level});
  const finished = summarize({id: 'done', mode, area, level, period, questions, date,
    responses: questions.map(question => ({answer: question.answer}))});
  const unfinished = summarize({id: 'pending', mode, area, level, period, questions, date, responses: []});
  local.put(adventureKey(null, 1), [finished, finished, unfinished]);
  const word = catalog('fr')[0];
  local.put(reviewKey(null, 'fr', 1), recordReview(null, 'fr', word.id, 'good', now - 2 * day));
  const today = readLearningToday(local, null, 1, now);
  assert.equal(today.languages[0].completed, 1);
  assert.equal(today.completedAdventures, 1);
  assert.equal(today.earnedBadges, 2);
  assert.equal(today.activityCount, 2);
  assert.equal(today.dailyComplete, true);
  assert.equal(today.languages[0].review.dueCount, 1);
  assert.equal(today.next.href, '/review.html?lang=fr&learner=1');
  assert.equal(readLearningToday(local, null, 1, now - 2 * day).next.href, '/french.html?learner=1');
  assert.equal(readLearningToday(local, null, 1, now + day).dailyComplete, false);
});
