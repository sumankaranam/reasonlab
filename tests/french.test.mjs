import test from 'node:test';
import assert from 'node:assert/strict';
import { conversations, lessons, parentTips, soundTips, stages, stories } from '../public/french-data.js';
import { VERSION, assess, checkpoint, cleanProgress, emptyProgress, frenchKey, makeExercises, recordCompletion, reviewQueue, skillSummary, summarize } from '../public/french-engine.js';

const seedSet = [1, 2, 17, 99, 2026, 0x7fffffff, 0xffffffff];
const unique = (items) => new Set(items).size === items.length;

test('French content has unique lessons, complete stages, and learner-friendly original models', () => {
  assert.equal(stages.length, 6);
  assert.ok(unique(stages.map((stage) => stage.id)));
  assert.ok(unique(lessons.map((lesson) => lesson.id)));
  for (const stage of stages) {
    const stageLessons = lessons.filter((lesson) => lesson.stage === stage.id);
    assert.ok(stageLessons.length >= 3, `${stage.id} has lesson content`);
    for (const lesson of stageLessons) {
      assert.ok(lesson.title && lesson.goal && lesson.tip);
      assert.ok(lesson.words.length >= 5);
      assert.ok(lesson.words.every((word) => word.fr && word.en));
      assert.ok(lesson.tasks.length >= 3);
      assert.ok(lesson.tasks.every((task) => task.prompt && task.answer && task.explanation));
    }
  }
  assert.ok(soundTips.length >= 8);
  assert.ok(soundTips.every((tip) => tip.title && tip.example && tip.note));
  assert.ok(parentTips.length >= 5);
  assert.ok(parentTips.some((tip) => /choose/i.test(tip)));
  assert.ok(parentTips.some((tip) => /not a CEFR|not.*certificate/i.test(tip)));
});

test('lesson exercise banks and stage checkpoints are valid and reproducible across seeds and modes', () => {
  for (const seed of seedSet) {
    for (const lesson of lessons) {
      for (const mode of ['mixed', 'listening']) {
        const tasks = makeExercises(lesson, lessons, seed, mode);
        assert.ok(tasks.length > 0);
        assert.ok(unique(tasks.map((task) => task.id)));
        assert.deepEqual(tasks, makeExercises(lesson, lessons, seed, mode));
        for (const task of tasks) {
          assert.equal(task.lessonId, lesson.id);
          assert.ok(['reading', 'listening', 'writing', 'conversation'].includes(task.skill));
          assert.ok(task.answer);
          if (task.kind === 'choice') {
            assert.ok(task.choices.length >= 2);
            assert.ok(unique(task.choices.map((choice) => choice.normalize('NFC'))));
            assert.ok(task.choices.includes(task.answer));
          }
        }
        if (mode === 'listening') assert.ok(tasks.every((task) => task.kind === 'choice' && task.skill === 'listening'));
      }
    }
    for (const stage of stages) {
      const selected = checkpoint(stage.id, lessons, seed);
      assert.ok(selected.length <= 12);
      assert.ok(unique(selected.map((task) => task.id)));
      assert.ok(selected.every((task) => lessons.some((lesson) => lesson.stage === stage.id && lesson.id === task.lessonId)));
      assert.deepEqual(selected, checkpoint(stage.id, lessons, seed));
    }
  }
});

test('answer checking normalizes accents and punctuation without treating missing accents as fully correct', () => {
  const task = { answer: 'Où est-ce que tu habites ?' };
  assert.deepEqual(assess(task, '  OÙ est-ce que tu habites!  '), { correct: true, accentOnly: false });
  assert.deepEqual(assess({ answer: 'école' }, 'ecole'), { correct: false, accentOnly: true });
  assert.deepEqual(assess({ answer: 's’il vous plaît' }, "s'il vous plaît."), { correct: true, accentOnly: false });
  assert.deepEqual(assess(task, '   '), { correct: false, accentOnly: false });
});

test('helped answers are not credited as independent correct answers', () => {
  const tasks = [
    { id: 'a', kind: 'type', skill: 'writing', prompt: 'Translate', answer: 'bonjour', explanation: 'Hello.' },
    { id: 'b', kind: 'type', skill: 'writing', prompt: 'Translate', answer: 'merci', explanation: 'Thanks.' }
  ];
  const result = summarize(tasks, [{ response: 'bonjour' }, { response: 'merci', assisted: true }]);
  assert.equal(result.correct, 1);
  assert.equal(result.answered, 2);
  assert.equal(result.assisted, 1);
  assert.equal(result.skills.writing.correct, 1);
  assert.equal(result.missed[0].assisted, true);
});

test('lesson review intervals advance through the designed one, three, seven, fourteen and thirty days', () => {
  const day = 86_400_000;
  const now = 1_800_000_000_000;
  let current = now;
  let progress = emptyProgress();
  for (const [box, interval] of [1, 3, 7, 14, 30].entries()) {
    const before = progress.lessons.topic;
    const expectedBox = before ? Math.min(4, before.box + 1) : 0;
    progress = recordCompletion(progress, 'topic', { total: 10, correct: 9, answered: 10, assisted: 0, pct: 90, stars: 3, skills: {} }, current);
    assert.equal(progress.lessons.topic.box, expectedBox);
    assert.equal(progress.lessons.topic.due, current + interval * day);
    current = progress.lessons.topic.due;
  }
  assert.deepEqual(reviewQueue(progress, [{ id: 'topic' }], progress.lessons.topic.due).map((lesson) => lesson.id), ['topic']);
  assert.deepEqual(reviewQueue(progress, [{ id: 'topic' }], progress.lessons.topic.due - 1), []);
});

test('progress history is capped at 100 entries and cleaned against schema and allowed lessons', () => {
  let progress = emptyProgress();
  for (let i = 0; i < 105; i++) {
    progress = recordCompletion(progress, `id-${i}`, { total: 1, correct: i % 2, answered: 1, assisted: 0, pct: i % 2 ? 100 : 0, stars: 1, skills: { reading: { total: 1, correct: i % 2, assisted: 0 } } }, 1000 + i, false);
  }
  assert.equal(progress.history.length, 100);
  assert.equal(progress.history[0].id, 'id-104');
  const cleaned = cleanProgress({ ...progress, version: VERSION }, ['id-104']);
  assert.equal(cleaned.history.length, 100);
  assert.deepEqual(cleaned.lessons, {});
  const withLesson = recordCompletion(emptyProgress(), 'allowed', { total: 2, correct: 2, answered: 2, assisted: 0, pct: 100, stars: 3, skills: {} }, 42);
  const checked = cleanProgress({ ...withLesson, lessons: { ...withLesson.lessons, outsider: withLesson.lessons.allowed }, history: [...withLesson.history, { ...withLesson.history[0], id: '../bad' }] }, ['allowed']);
  assert.deepEqual(Object.keys(checked.lessons), ['allowed']);
  assert.equal(checked.history.length, 1);
  assert.equal(cleanProgress({ ...progress, version: 99 }, ['id-104']).history.length, 0);
});

test('French history identity separates guest/account contexts and learner slots', () => {
  const adult = '12345678-1234-1234-1234-123456789abc';
  assert.notEqual(frenchKey(), frenchKey(adult));
  assert.equal(new Set([frenchKey(null, 1), frenchKey(null, 2), frenchKey(null, 3)]).size, 3);
  assert.equal(new Set([frenchKey(adult, 1), frenchKey(adult, 2), frenchKey(adult, 3)]).size, 3);
  assert.notEqual(frenchKey(null, 1), frenchKey(adult, 1));
  assert.throws(() => frenchKey(null, 0), /learner/i);
});

test('conversation and story content includes guided choices and clear comprehension answers', () => {
  assert.ok(conversations.length >= 6);
  assert.ok(unique(conversations.map((scene) => scene.id)));
  for (const scene of conversations) {
    assert.ok(scene.title && scene.scene && scene.turns.length >= 3);
    for (const turn of scene.turns) {
      assert.ok(turn.speaker && turn.fr && turn.en && turn.reply && turn.explanation);
      assert.ok(turn.choices.length >= 2);
      assert.ok(turn.choices.every((choice) => choice.fr && choice.en));
      assert.ok(Number.isInteger(turn.answer) && turn.answer >= 0 && turn.answer < turn.choices.length);
    }
  }
  assert.ok(stories.length >= 6);
  for (const story of stories) {
    assert.ok(story.title && story.fr && story.en && story.questions.length >= 3);
    for (const question of story.questions) {
      assert.ok(question.prompt && question.choices.length >= 3 && question.explanation);
      assert.ok(question.choices.includes(question.answer));
    }
  }
});

test('skill summaries use recent practice and omit unsupported certification language', () => {
  const history = Array.from({ length: 12 }, (_, i) => ({ id: `r${i}`, date: i, total: 1, correct: i < 8 ? 1 : 0, assisted: 0, skills: { reading: { total: 1, correct: i < 8 ? 1 : 0, assisted: 0 } } }));
  const summary = skillSummary({ history });
  assert.equal(summary[0].total, 10);
  assert.equal(summary[0].pct, 80);
  assert.equal(summary[0].label, 'Going well');
});
