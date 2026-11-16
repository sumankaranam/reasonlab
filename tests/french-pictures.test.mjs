import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../public/french-data.js';
import {lessonPicture, pictureLessonIds, wordPicture} from '../public/french-pictures.js';

const titleOf = (svg) => svg.match(/<title id="[^"]+">([\s\S]*?)<\/title>/)?.[1];

test('word cards map complete normalized phrases without substring matches', () => {
  assert.equal(titleOf(wordPicture('une pomme', 'an apple')), 'An apple');
  assert.equal(titleOf(wordPicture('le pain', 'some bread')), 'Bread');
  assert.equal(titleOf(wordPicture('bleue', 'blue (feminine)')), 'Bleue, the color blue');
  assert.match(titleOf(wordPicture('train', 'train')), /^Scene for train — train$/);
  assert.match(titleOf(wordPicture('pommier', 'apple tree')), /^Scene for/);
});

test('unrecognized phrases are safely escaped in accessible scene titles', () => {
  const svg = wordPicture('<img src=x onerror="alert(1)">', 'A & B', 'food');
  assert.match(svg, /role="img" aria-labelledby="picture-title-/);
  assert.ok(svg.includes('Scene for &lt;img src=x onerror=&quot;alert(1)&quot;&gt; — A &amp; B'));
  assert.doesNotMatch(svg, /<img src=x/);
  assert.match(titleOf(wordPicture('bonjour', 'hello')), /A friendly wave/);
});

test('French and English number forms show the correct quantities from zero through twenty', () => {
  const fr = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf','vingt'];
  const en = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  for (let n=0; n<=20; n++) {
    const svg = wordPicture(fr[n], en[n], 'numbers');
    assert.match(titleOf(svg), new RegExp(`^${n} object${n===1?'':'s'}:`));
    assert.equal((svg.match(/fill="#f05f56"/g) || []).length, n, `quantity ${n}`);
    assert.match(svg, new RegExp(`>${n}<`));
  }
  assert.equal((wordPicture('twenty-one','twenty-one').match(/fill="#f05f56"/g) || []).length, 0);
});

test('color cards use the named color as a swatch and include a readable label', () => {
  for (const [fr,en,hex,label] of [
    ['rouge','red','#ed4b55','red'],['bleu','blue','#4098df','blue'],['verte','green','#50b76b','green'],
    ['jaune','yellow','#ffd23f','yellow'],['noir','black','#303743','black'],['blanche','white','#fff','white'],
  ]) {
    const svg = wordPicture(fr,en);
    assert.match(svg, new RegExp(`fill="${hex.replace('#','\\#')}"`));
    assert.match(svg, new RegExp(`>${label}<`));
  }
});

test('every authored lesson has its own accessible, non-fallback picture scene', () => {
  assert.deepEqual(pictureLessonIds, lessons.map(({id})=>id));
  for (const id of pictureLessonIds) {
    const svg = lessonPicture(id);
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 240 160" role="img"/);
    assert.ok(titleOf(svg));
    assert.doesNotMatch(titleOf(svg), /^Scene for/);
  }
  assert.match(titleOf(lessonPicture('unlisted-lesson')), /^Scene for unlisted lesson$/);
});
