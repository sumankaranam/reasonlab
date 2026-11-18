import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons, stages, conversations, stories} from '../public/french-data.js';
import {activityDraft, activityFor, restoreActivity} from '../public/french-activities.js';
import {normalize} from '../public/french-engine.js';
import {contentVersion, journeyChapters, missions} from '../public/french-journey.js';

const newStages = ['community', 'outings'];
const addedLessons = lessons.filter(lesson => newStages.includes(lesson.stage));

function assertUniqueAnswer(choices, answer) {
  const normalizedChoices = choices.map(normalize);
  assert.equal(new Set(normalizedChoices).size, choices.length);
  assert.equal(normalizedChoices.filter(choice => choice === normalize(answer)).length, 1);
}

test('the two new stages add 12 lessons with stable practice and card entry points', () => {
  assert.equal(lessons.length, 48);
  assert.equal(journeyChapters.length, 8);
  assert.deepEqual(stages.slice(-2).map(stage => stage.id), newStages);
  assert.deepEqual(lessons.slice(36), addedLessons);
  assert.equal(new Set(lessons.map(lesson => lesson.id)).size, 48);
  newStages.forEach((stage, index) => {
    const stageLessons = addedLessons.filter(lesson => lesson.stage === stage);
    assert.equal(stageLessons.length, 6);
    assert.deepEqual(journeyChapters[6 + index].lessonIds, stageLessons.map(lesson => lesson.id));
    assert.equal(activityFor({kind:'checkpoint', id:stage, seed:27}).tasks.length, 12);
    for (const lesson of stageLessons) {
      assert.ok(lesson.tip && lesson.goal);
      assert.ok(lesson.words.length >= 6 && lesson.words.length <= 8);
      assert.equal(new Set(lesson.words.map(word => normalize(word.fr))).size, lesson.words.length);
      assert.equal(new Set(lesson.words.map(word => normalize(word.en))).size, lesson.words.length);
      assert.deepEqual(lesson.tasks.map(task => task.kind), ['choice','type','build','choice','choice','type']);
      const practice = activityFor({kind:'lesson', id:lesson.id, seed:27, mode:'reading'});
      const deck = activityFor({kind:'cards', id:lesson.id, seed:27});
      assert.equal(practice.tasks.length, lesson.words.length + 6);
      assert.equal(deck.tasks.length, lesson.words.length);
      assert.deepEqual(restoreActivity(activityDraft(practice, 100))?.tasks, practice.tasks);
      for (const task of practice.tasks) {
        assert.ok(task.prompt && task.answer && task.explanation);
        if (task.choices) assertUniqueAnswer(task.choices, task.answer);
      }
    }
  });
  const daily = activityFor({kind:'daily', id:'daily', seed:27, lessonIds:lessons.map(lesson => lesson.id)});
  const draft = activityDraft(daily, 100);
  assert.equal(draft.version, contentVersion);
  assert.equal(draft.lessonIds.length, 48);
  assert.deepEqual(restoreActivity(draft)?.tasks, daily.tasks);
});

test('new conversations and missions rebuild as continuous bilingual exercises', () => {
  const addedConversations = conversations.filter(conversation => newStages.includes(conversation.stage));
  const addedMissions = missions.slice(6);
  assert.equal(addedConversations.length, 4);
  assert.equal(addedMissions.length, 2);
  assert.deepEqual(addedMissions.map(mission => mission.chapterId), journeyChapters.slice(6).map(chapter => chapter.id));
  for (const conversation of [...addedConversations, ...addedMissions]) {
    const kind = conversation.chapterId ? 'mission' : 'chat';
    assert.ok(conversation.scene);
    if (kind === 'mission') assert.ok(conversation.turns.length >= 4 && conversation.turns.length <= 6);
    else assert.equal(conversation.turns.length, 4);
    const activity = activityFor({kind, id:conversation.id, seed:27});
    assert.equal(activity.tasks.length, conversation.turns.length);
    assert.deepEqual(restoreActivity(activityDraft(activity, 100))?.tasks, activity.tasks);
    conversation.turns.forEach((turn, index) => {
      assert.ok(turn.fr && turn.en && turn.reply && turn.speaker && turn.explanation);
      assert.equal(turn.choices.length, 2);
      assert.ok(turn.choices.every(choice => choice.fr && choice.en));
      assertUniqueAnswer(activity.tasks[index].choices, turn.choices[turn.answer].fr);
      if (index < conversation.turns.length - 1) assert.equal(turn.reply, conversation.turns[index + 1].fr);
    });
  }
});

test('the added stories provide bilingual passages with three answerable questions each', () => {
  const addedStories = stories.filter(story => newStages.includes(story.stage));
  assert.deepEqual(addedStories.map(story => story.stage), newStages);
  for (const story of addedStories) {
    const activity = activityFor({kind:'story', id:story.id, seed:27});
    assert.ok(activity.passage && activity.translation);
    assert.equal(activity.tasks.length, 3);
    for (const task of activity.tasks) {
      assert.ok(task.prompt && task.explanation);
      assertUniqueAnswer(task.choices, task.answer);
    }
  }
});
