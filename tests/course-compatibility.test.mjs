import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {lessons} from '../public/french-data.js';
import {courses} from '../public/indic-data.js';
import {makeExercises} from '../public/french-engine.js';

const baseline=JSON.parse(readFileSync(new URL('./fixtures/course-expansion-baseline.json',import.meta.url)));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
test('course expansion preserves existing lesson data and vocabulary indices',()=>{
 for(const [name,current] of [['french',lessons],['kannada',courses.kn.lessons],['tamil',courses.ta.lessons]]){
  assert.deepEqual(current.slice(0,baseline[name].length).map(l=>l.id),baseline[name].map(l=>l.id));
  for(const old of baseline[name])assert.equal(hash(current.find(l=>l.id===old.id)),old.hash,old.id);
 }
});
test('original French seeded exercises remain compatible with saved sessions',()=>{
 for(const old of baseline.french){
  const lesson=lessons.find(l=>l.id===old.id);
  [1,42,987].forEach((seed,i)=>assert.equal(hash(makeExercises(lesson,lessons,seed,'mixed')),old.exercises[i],`${old.id}: ${seed}`));
 }
});
