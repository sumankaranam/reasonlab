import {progressKeys} from './auth-core.js';

export const PASS = 70;
export const slots = [1, 2, 3];
export const blankProgress = () => ({version: 1, completed: {}, activity: null});

export function storageKey(language, userId, slot) {
  if (!['ta', 'kn'].includes(language) || !slots.includes(slot)) {
    throw Error('Invalid course or learner slot');
  }
  return `${progressKeys(userId).settings}:indic:${language}:${slot}`;
}

export function quizOptions(lesson, index) {
  const words = lesson.words;
  const count = Math.min(4, words.length);
  return Array.from({length: count}, (_, i) => (
    (index + (i + count - index % count) % count) % words.length
  ));
}

export function quizScore(answers) {
  if (!answers.length || answers.includes(null)) return null;
  const correct = answers.filter((answer, index) => answer === index).length;
  return Math.floor(100 * correct / answers.length);
}

export function cleanProgress(course, raw) {
  const result = blankProgress();
  if (raw?.version !== result.version) return result;
  for (const lesson of course.lessons) {
    const score = raw.completed?.[lesson.id];
    const possible = lesson.words.some((_, index) =>
      Math.floor(100 * (index + 1) / lesson.words.length) === score
    );
    if (possible && score >= PASS) result.completed[lesson.id] = score;
  }
  const {activity} = raw;
  if (!activity) return result;
  const lesson = course.lessons.find(item => item.id === activity.lesson);
  if (!lesson) return result;
  const {mode, index} = activity;
  const limit = mode === 'dialogue' ? lesson.dialogue.length : lesson.words.length;
  if (!['cards', 'quiz', 'dialogue'].includes(mode) ||
      !Number.isInteger(index) || index < 0 || index >= limit) return result;
  result.activity = {lesson: lesson.id, mode, index};
  if (mode === 'quiz') {
    const answers = activity.answers;
    if (!Array.isArray(answers) || answers.length !== limit || answers.some((answer, i) =>
      i < index ? !quizOptions(lesson, i).includes(answer) :
      i === index ? answer !== null && !quizOptions(lesson, i).includes(answer) :
      answer !== null
    )) result.activity = null;
    else result.activity.answers = answers.slice();
  }
  return result;
}

export function readProgress(storage, key, course) {
  return cleanProgress(course, JSON.parse(storage.getItem(key)));
}

export function writeProgress(storage, key, course, progress) {
  // Preserve achievements earned in another open tab.
  let previous;
  try {
    previous = readProgress(storage, key, course);
  } catch {
    previous = blankProgress();
  }
  for (const [lesson, score] of Object.entries(previous.completed)) {
    progress.completed[lesson] = Math.max(score, progress.completed[lesson] || 0);
  }
  storage.setItem(key, JSON.stringify(progress));
}
