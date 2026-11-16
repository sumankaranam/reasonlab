import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blankProgress, cleanProgress, quizOptions, quizScore, readProgress, storageKey, writeProgress
} from '../public/indic-engine.js';
import {courses} from '../public/indic-data.js';

const account = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const course = courses.ta;
const lesson = course.lessons[0];

test('language, account and slot are independent progress scopes', () => {
  const keys = ['ta', 'kn'].flatMap(lang => [null, account, other].flatMap(user =>
    [1, 2, 3].map(slot => storageKey(lang, user, slot))
  ));
  assert.equal(new Set(keys).size, 18);
  assert.throws(() => storageKey('es', account, 1));
  assert.throws(() => storageKey('ta', account, 0));
  assert.throws(() => storageKey('ta', 'invalid', 1));
});

test('quiz offers distinct options with one matching answer for each prompt', () => {
  for (const course of Object.values(courses)) {
    for (const lesson of course.lessons) {
      for (const index of lesson.words.keys()) {
        const options = quizOptions(lesson, index);
        assert.ok(options.includes(index));
        assert.equal(new Set(options).size, Math.min(4, lesson.words.length));
        assert.equal(new Set(options.map(option => lesson.words[option].meaning)).size, options.length);
      }
    }
  }
  assert.equal(quizScore([0, 1, 2, 0]), 75);
  assert.equal(quizScore([0, 1, 2, 0, 0, 0]), 50);
  assert.equal(quizScore([0, null]), null);
});

test('restore ignores unsupported versions, foreign lessons and impossible results', () => {
  assert.deepEqual(cleanProgress(course, {version: 2}), blankProgress());
  const raw = {
    version: 1,
    completed: {[lesson.id]: 75, [course.lessons[1].id]: 78, [courses.kn.lessons[0].id]: 100},
    activity: {lesson: lesson.id, mode: 'quiz', index: 1, answers: [0, 0, null, null]}
  };
  assert.deepEqual(cleanProgress(course, raw), {...raw, completed: {[lesson.id]: 75}});
  raw.activity.answers[2] = 2;
  raw.completed[lesson.id] = 50;
  assert.deepEqual(cleanProgress(course, raw), blankProgress());
  raw.activity = {lesson: lesson.id, mode: 'dialogue', index: lesson.dialogue.length};
  assert.deepEqual(cleanProgress(course, raw), blankProgress());
});

test('saving keeps best quiz results from another tab and uses separate keys', () => {
  const data = new Map();
  const storage = {setItem: (key, value) => data.set(key, value), getItem: key => data.get(key) ?? null};
  const key = storageKey('ta', account, 1);
  const earlier = {...blankProgress(), completed: {[lesson.id]: 100}};
  const later = {...blankProgress(), completed: {[lesson.id]: 75}, activity: {lesson: lesson.id, index: 1, mode: 'cards'}};
  writeProgress(storage, key, course, earlier);
  writeProgress(storage, key, course, later);
  assert.deepEqual(readProgress(storage, key, course), {...later, completed: earlier.completed});
  assert.deepEqual(readProgress(storage, storageKey('ta', account, 2), course), blankProgress());
});
