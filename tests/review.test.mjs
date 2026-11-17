import assert from 'node:assert/strict';
import test from 'node:test';
import {catalog, cleanReview, dueCards, recordReview, reviewKey, reviewSummary} from '../public/review-core.js';

const DAY = 86_400_000;
const start = new Date(2026, 10, 16, 12).getTime();
const first = catalog('fr')[0].id;

test('successful reviews advance at due boundaries; a lapse returns the word tomorrow', () => {
  let state;
  let now = start;
  for (const interval of [1, 3, 7, 14, 30, 30]) {
    state = recordReview(state, 'fr', first, 'good', now);
    assert.equal(state.cards[first].interval, interval);
    assert.equal(state.cards[first].due, now + interval * DAY);
    assert.deepEqual(recordReview(state, 'fr', first, 'good', now + 1000), state);
    assert.deepEqual(recordReview(state, 'fr', first, 'good', state.cards[first].due - 1), state);
    now += interval * DAY;
  }
  state = recordReview(state, 'fr', first, 'again', now);
  assert.deepEqual(state.cards[first], {due: now + DAY, interval: 1, reviews: 7, lapses: 1, lastReviewed: now});
});

test('daily deck survives reload, prioritizes completed lessons for new words, then prioritizes due words', () => {
  let state;
  const words = dueCards(state, 'ta', start, 7, ['ta-family']);
  assert.equal(words.length, 5);
  assert.ok(words.every(word => word.lessonId === 'ta-family'));
  for (const [index, word] of words.entries()) {
    state = recordReview(state, 'ta', word.id, 'good', start);
    state = cleanReview(JSON.parse(JSON.stringify(state)), 'ta');
    assert.equal(dueCards(state, 'ta', start, 5, ['ta-family']).length, 4 - index);
    assert.ok(dueCards(state, 'ta', start).every(candidate => candidate.id !== word.id));
  }
  assert.deepEqual(reviewSummary(state, 'ta', start), {dueCount: 0, readyCount: 0, nextDue: start + DAY, reviewedToday: 5});
  assert.deepEqual(new Set(dueCards(state, 'ta', start + DAY).map(word => word.id)), new Set(words.map(word => word.id)));
});

test('clean state keeps bounded catalog records and strips unexpected data', () => {
  const item = {due: start + DAY, interval: 1, lapses: 0, reviews: 1, lastReviewed: start};
  const raw = {
    version: 1,
    cards: {
      [first]: {...item, text: 'word', answer: 'learner input'},
      [catalog('fr')[1].id]: {...item, reviews: '1'},
      [catalog('fr')[2].id]: {...item, lapses: 2},
      [catalog('fr')[3].id]: {...item, due: 0},
      [catalog('ta')[0].id]: item,
      unknown: item,
    },
  };
  assert.deepEqual(cleanReview(raw, 'fr'), {version: 1, cards: {[first]: item}});
  assert.deepEqual(cleanReview({version: 2, cards: raw.cards}), {version: 1, cards: {}});
  assert.deepEqual(recordReview(raw, 'fr', 'unknown', 'good', start), cleanReview(raw, 'fr'));
  for (const language of ['fr', 'ta', 'kn']) {
    const words = catalog(language);
    assert.ok(words.length >= 5 && words.every(word => word.text && word.meaning));
    assert.equal(new Set(words.map(word => word.id)).size, words.length);
  }
});

test('review storage separates accounts, languages and learner slots', () => {
  const keys = [null, '11111111-1111-4111-8111-111111111111'].flatMap(id => ['fr', 'ta', 'kn']
    .flatMap(language => [1, 2, 3].map(slot => reviewKey(id, language, slot))));
  assert.equal(new Set(keys).size, 18);
  assert.throws(() => reviewKey(null, 'en', 1));
  assert.throws(() => reviewKey(null, 'fr', 0));
  assert.throws(() => reviewKey('unverified', 'fr', 1));
});
