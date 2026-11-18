import test from 'node:test';
import assert from 'node:assert/strict';
import {courses} from '../public/indic-data.js';

const expanded = courses.kn.lessons.slice(12);

test('Kannada continues through three groups of four lessons', () => {
  assert.equal(courses.ta.lessons.length, 12);
  assert.equal(courses.kn.lessons.length, 24);
  assert.deepEqual(expanded.map(({id, stage}) => [id, stage]), [
    ['kn-home', 4], ['kn-clothes', 4], ['kn-weather', 4], ['kn-feelings', 4],
    ['kn-time', 5], ['kn-market', 5], ['kn-travel', 5], ['kn-sports', 5],
    ['kn-invite', 6], ['kn-yesterday', 6], ['kn-tomorrow', 6], ['kn-help', 6]
  ]);
  const ids = Object.values(courses).flatMap(course => course.lessons.map(lesson => lesson.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('new Kannada cards and dialogue provide readable native text and unique quiz meanings', () => {
  for (const {id, words, dialogue} of expanded) {
    assert.ok(words.length >= 6 && words.length <= 8, id);
    assert.ok(dialogue.length >= 4, id);
    assert.equal(new Set(words.map(word => word.text)).size, words.length, id);
    assert.equal(new Set(words.map(word => word.meaning.toLowerCase())).size, words.length, id);
    assert.ok(words.every(word => word.icon.trim()), id);
    for (const {text, roman, meaning} of [...words, ...dialogue]) {
      assert.match(text, /\p{Script=Kannada}/u, id);
      assert.match(text, /^[\p{Script=Kannada}\p{Punctuation}\s\u200c]+$/u, id);
      assert.match(roman, /\p{Script=Latin}/u, id);
      assert.match(meaning, /[A-Za-z]/, id);
    }
  }
});

test('the market dialogue totals the stated price and the final dialogue resolves a request', () => {
  const market = expanded.find(lesson => lesson.id === 'kn-market');
  assert.match(market.dialogue[1].text, /ಒಂದು ಕಿಲೋಗೆ ನಲವತ್ತು ರೂಪಾಯಿ/u);
  assert.match(market.dialogue[2].text, /ಅರ್ಧ ಕಿಲೋ/u);
  assert.match(market.dialogue[3].text, /ಇಪ್ಪತ್ತು ರೂಪಾಯಿ/u);

  const help = expanded.find(lesson => lesson.id === 'kn-help');
  assert.match(help.dialogue[0].text, /ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ದಾರಿ/u);
  assert.match(help.dialogue[2].text, /ಇನ್ನೊಮ್ಮೆ ಹೇಳಿ/u);
  assert.match(help.dialogue.at(-1).text, /ಈಗ ಅರ್ಥವಾಯಿತು/u);
});
