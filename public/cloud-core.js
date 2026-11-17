import {progressKeys} from './auth-core.js';
import {cleanProfiles, profileKey} from './child-profiles.js';
import {domains} from './kids-engine.js';
import {cleanHistory, storageKey as adventureKey} from './adventure-engine.js';
import {cleanProgress as cleanFrench, frenchKey} from './french-engine.js';
import {cleanJourney, missions} from './french-journey.js';
import {lessons, stages, stories, conversations} from './french-data.js';
import {courses} from './indic-data.js';
import {cleanProgress as cleanIndic, storageKey as indicKey} from './indic-engine.js';
import {cleanReview, reviewKey} from './review-core.js';

const slots = [1, 2, 3];
const indicLanguages = ['ta', 'kn'];
const vocabularyLanguages = ['fr', ...indicLanguages];
const lessonIds = lessons.map(lesson => lesson.id);
const activityIds = new Set([
  ...lessonIds, 'daily',
  ...stages.map(stage => 'checkpoint:' + stage.id),
  ...stories.map(story => 'story:' + story.id),
  ...conversations.map(chat => 'chat:' + chat.id),
  ...missions.map(mission => 'mission:' + mission.id)
]);
const mapBy = (keys, make) => Object.fromEntries(keys.map(key => [key, make(key)]));
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validUser = userId => {
  if (typeof userId !== 'string' || !userId) throw Error('An adult account is required');
  progressKeys(userId);
};

function cleanSettings(raw, french = false) {
  const clean = {};
  if (slots.includes(raw?.profile)) clean.profile = raw.profile;
  if (integer(raw?.grade, 1, 10)) clean.grade = raw.grade;
  if (!french && slots.includes(raw?.stage)) clean.stage = raw.stage;
  return clean;
}

function cleanKids(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(record =>
    record?.version === 2 && slots.includes(record.profile) && slots.includes(record.stage) &&
    integer(record.grade, 1, 10) && integer(record.seed, 0, 0xffffffff) &&
    ['practice', 'daily', 'checkin'].includes(record.mode) && typeof record.assisted === 'boolean' &&
    integer(record.date, 0, 8640000000000000) && integer(record.seconds, 0, Number.MAX_SAFE_INTEGER) &&
    integer(record.total, 1, 200) && integer(record.answered, 0, record.total) &&
    integer(record.correct, 0, record.answered) && Array.isArray(record.domains) &&
    record.domains.length > 0 && record.domains.length <= domains.length &&
    new Set(record.domains.map(item => item?.domain)).size === record.domains.length &&
    record.domains.every(item => domains.includes(item?.domain) &&
      integer(item.total, 1, record.total) && integer(item.correct, 0, item.total)) &&
    record.domains.reduce((sum, item) => sum + item.total, 0) === record.total &&
    record.domains.reduce((sum, item) => sum + item.correct, 0) === record.correct
  ).slice(0, 150).map(record => {
    const {version, profile, stage, grade, seed, mode, assisted, date, seconds, total, answered, correct} = record;
    return {version, profile, stage, grade, seed, mode, assisted, date, seconds, total, answered, correct,
      domains: record.domains.map(({domain, total, correct}) => ({domain, total, correct}))};
  });
}

function cleanFrenchSnapshot(raw) {
  const progress = cleanFrench(raw, lessonIds);
  progress.history = progress.history.filter(record => activityIds.has(record.id)).map(record => ({
    ...record,
    skills: mapBy(Object.keys(record.skills), skill => {
      const {total, correct, assisted} = record.skills[skill];
      return {total, correct, assisted};
    })
  }));
  const {draft, ...journey} = cleanJourney({...raw?.journey, draft: null}, lessons);
  return {...progress, journey};
}

export function cleanSnapshot(raw) {
  if (!object(raw) || raw.version !== 1 || !Array.isArray(raw.kids) ||
      !['profiles', 'settings', 'adventures', 'french', 'indic', 'vocabulary'].every(key => object(raw[key]))) {
    return null;
  }
  const course = (language, slot) => {
    const {activity, ...completion} = cleanIndic(courses[language], {...raw.indic[language]?.[slot], activity: null});
    return completion;
  };
  return {
    version: 1,
    profiles: cleanProfiles(raw.profiles),
    settings: {kids: cleanSettings(raw.settings.kids), french: cleanSettings(raw.settings.french, true)},
    kids: cleanKids(raw.kids),
    adventures: mapBy(slots, slot => cleanHistory(raw.adventures[slot])),
    french: mapBy(slots, slot => cleanFrenchSnapshot(raw.french[slot])),
    indic: mapBy(indicLanguages, language => mapBy(slots, slot => course(language, slot))),
    vocabulary: mapBy(vocabularyLanguages, language =>
      mapBy(slots, slot => cleanReview(raw.vocabulary[language]?.[slot], language)))
  };
}

export function readSnapshot(storage, userId) {
  validUser(userId);
  const keys = progressKeys(userId);
  const read = key => JSON.parse(storage.getItem(key));
  const many = key => mapBy(slots, slot => read(key(slot)));
  const profiles = read(profileKey(userId));
  const kids = read(keys.history);
  if ((profiles !== null && !object(profiles)) || (kids !== null && !Array.isArray(kids))) {
    throw Error('Invalid local progress');
  }
  return cleanSnapshot({
    version: 1,
    profiles: object(profiles) ? profiles : {},
    settings: {kids: read(keys.settings), french: read(keys.settings + ':french')},
    kids: Array.isArray(kids) ? kids : [],
    adventures: many(slot => adventureKey(userId, slot)),
    french: many(slot => frenchKey(userId, slot)),
    indic: mapBy(indicLanguages, lang => many(slot => indicKey(lang, userId, slot))),
    vocabulary: mapBy(vocabularyLanguages, lang => many(slot => reviewKey(userId, lang, slot)))
  });
}

export function applySnapshot(storage, userId, raw, {preserveDrafts = false} = {}) {
  validUser(userId);
  const data = cleanSnapshot(raw);
  if (!data) throw Error('Invalid progress snapshot');
  const keys = progressKeys(userId);
  const entries = [
    [profileKey(userId), data.profiles], [keys.settings, data.settings.kids],
    [keys.settings + ':french', Object.keys(data.settings.french).length ? data.settings.french : null],
    [keys.history, data.kids]
  ];
  const draftFrom = (key, lookup) => {
    if (!preserveDrafts) return null;
    const value = storage.getItem(key);
    try { return lookup(JSON.parse(value)); }
    catch { return null; }
  };
  for (const slot of slots) {
    const french = frenchKey(userId, slot);
    const draft = draftFrom(french, local => cleanJourney(local?.journey, lessons).draft);
    entries.push([adventureKey(userId, slot), data.adventures[slot]]);
    entries.push([french, {...data.french[slot], journey: {...data.french[slot].journey, draft}}]);
    for (const lang of indicLanguages) {
      const key = indicKey(lang, userId, slot);
      const activity = draftFrom(key, local => cleanIndic(courses[lang], local).activity);
      entries.push([key, {...data.indic[lang][slot], activity}]);
    }
    for (const lang of vocabularyLanguages) {
      entries.push([reviewKey(userId, lang, slot), data.vocabulary[lang][slot]]);
    }
  }

  const previous = entries.map(([key]) => storage.getItem(key));
  let written = 0;
  try {
    for (const [key, value] of entries) {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, JSON.stringify(value));
      written++;
    }
  } catch (error) {
    for (let i = written - 1; i >= 0; i--) {
      const [key] = entries[i];
      try {
        if (previous[i] === null) storage.removeItem(key);
        else storage.setItem(key, previous[i]);
      } catch { /* Continue restoring the remaining keys. */ }
    }
    throw error;
  }
}

export function snapshotString(value) {
  return JSON.stringify(value, (_, item) => object(item)
    ? mapBy(Object.keys(item).sort(), key => item[key])
    : item);
}

export function snapshotEqual(a, b) {
  return snapshotString(a) === snapshotString(b);
}
