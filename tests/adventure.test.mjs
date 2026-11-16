import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areas, badges, cleanHistory, defaultLevel, evidence, makeSession, periodKey,
  seedFor, storageKey, suggestedLevel, summarize
} from '../public/adventure-engine.js';

const allAreas = areas.map(({id}) => id);
const weekdays = ['2026-10-12','2026-10-19','2026-10-26','2026-11-02','2026-11-09','2026-11-16'];
const ordinal = ['first','second','third','fourth','fifth','sixth'];

function independentlySolve(item) {
  const family = Number(item.id.split('-')[1]);
  const {area, prompt, visual} = item;
  if (area === 'patterns') {
    const values = visual.slice(0,-1).map(Number);
    const steps = values.slice(1).map((value,i) => value - values[i]);
    const next = family === 0 ? steps[0] : family === 1 ? steps.at(-2) :
      steps.at(-1) * 2 - steps.at(-2);
    return String(values.at(-1) + next);
  }
  if (area === 'logic') {
    if (family === 0) {
      const pairs = visual.map(line => line.match(/^(\w+) stands directly ahead of (\w+)\.$/).slice(1));
      const next = new Map(pairs);
      const behind = new Set(next.values());
      let name = [...next.keys()].find(value => !behind.has(value));
      const rank = ordinal.indexOf(prompt.match(/Who is (\w+)/)[1]);
      for (let i = 0; i < rank; i++) name = next.get(name);
      return name;
    }
    if (family === 1) {
      const [_, first, restriction, second] = prompt.match(/^A pass (?:needs a|must have a) (\S)(?:( and cannot have | and must also have )(\S))?\./u);
      const qualifying = visual.filter(line => line.includes(first) && (!restriction ||
        line.includes(second) === restriction.includes('must also')));
      assert.equal(qualifying.length, 1);
      return qualifying[0].split(' ')[0];
    }
    const colours = prompt.match(/colours are (.*)\. What colour/)[1].split(', ');
    return colours.find(colour => !visual.some(clue => clue.includes('the ' + colour + ' key')));
  }
  if (area === 'visual') {
    if (family === 0) {
      const seen = visual.slice(0,-1);
      const length = seen.findIndex((_, i) => i > 0 && seen.every((value,j) => value === seen[j % i]));
      return seen[seen.length % length];
    }
    if (family === 1) {
      const cycle = ['↑','→','↓','←'];
      const [first,second] = visual.map(value => cycle.indexOf(value));
      return cycle[(cycle.indexOf(visual.at(-2)) + second - first + 4) % 4];
    }
    return visual[visual.indexOf('│') * 2 - visual.indexOf('?')];
  }
  const sequence = item.memory.stimulus.split(' ');
  const index = ordinal.indexOf(prompt.match(/was (\w+) from/)[1]);
  assert.ok(index >= 0);
  assert.ok(!prompt.includes(item.memory.stimulus));
  assert.ok(!item.hint.includes(item.memory.stimulus));
  assert.equal(new Set(sequence).size, sequence.length);
  assert.ok(Number.isInteger(item.memory.durationMs) && item.memory.durationMs > 0);
  return sequence[prompt.includes('from the end') ? sequence.length - index - 1 : index];
}

test('generates distinct, solvable exercises with balanced coverage at each level', () => {
  for (let level = 1; level <= 3; level++) {
    const answerSlots = [0,0,0,0];
    for (let seed = 0; seed < 80; seed++) {
      for (const [mode,area,count] of [['daily','all',5],['weekly','all',12], ...allAreas.map(id => ['practice',id,6])]) {
        const settings = {seed,mode,area,level};
        const questions = makeSession(settings);
        assert.deepEqual(makeSession(settings), questions);
        assert.equal(questions.length,count);
        assert.equal(new Set(questions.map(q => q.id)).size,count);
        assert.equal(new Set(questions.map(q => JSON.stringify([q.prompt,q.visual,q.memory?.stimulus]))).size,count);
        for (const id of allAreas) {
          const areaItems = questions.filter(q => q.area === id);
          if (mode === 'weekly') assert.equal(areaItems.length,3);
          if (mode === 'daily') assert.ok(areaItems.length >= 1);
          if (mode === 'practice') assert.equal(areaItems.length,id === area ? 6 : 0);
          if (areaItems.length >= 3) assert.equal(new Set(areaItems.map(q => q.id.split('-')[1])).size,3);
        }
        for (const q of questions) {
          assert.equal(q.level,level);
          assert.equal(q.options.length,4);
          assert.equal(new Set(q.options).size,4);
          assert.equal(q.answer,independentlySolve(q));
          const slot = q.options.indexOf(q.answer);
          assert.ok(slot >= 0);
          answerSlots[slot]++;
          assert.ok(q.hint.length > 12 && q.explanation.length > 12);
        }
      }
    }
    assert.ok(answerSlots.every(n => n > 680 && n < 970));
  }
});

test('enforces mode, area, difficulty, and 32-bit seed contracts', () => {
  const base = {seed:1,mode:'daily',area:'all',level:1};
  for (const settings of [{seed:-1},{seed:2 ** 32},{seed:1.5},{mode:'check-in'},{area:'memory'},{mode:'practice'},{level:'1'}]) {
    assert.throws(() => makeSession({...base,...settings}));
  }
  assert.equal(makeSession({...base,seed:2 ** 32 - 1}).length,5);
  assert.notDeepEqual(makeSession(base),makeSession({...base,seed:2}));
  assert.equal(seedFor('Monday:🧩'),seedFor('Monday:🧩'));
  assert.notEqual(seedFor('Monday:🧩'),seedFor('Tuesday:🧩'));
  assert.deepEqual([1,3,4,6,7,10].map(defaultLevel),[1,1,2,2,3,3]);
  assert.throws(() => defaultLevel(11));
});

test('uses local calendar dates and starts weekly periods on Monday', () => {
  const sunday = new Date(2026,10,15,23,55);
  const monday = new Date(2026,10,16,0,1);
  assert.equal(periodKey('daily',sunday),'2026-11-15');
  assert.equal(periodKey('practice',sunday),'2026-11-15');
  assert.equal(periodKey('weekly',sunday),'2026-11-09');
  assert.equal(periodKey('weekly',monday),'2026-11-16');
  assert.equal(periodKey('weekly',new Date(2027,0,1)),'2026-12-28');
  assert.throws(() => periodKey('weekly',new Date(NaN)));
});

test('isolates guest, account and anonymous learner slots', () => {
  const accountA = '00000000-0000-0000-0000-000000000001';
  const accountB = '00000000-0000-0000-0000-000000000002';
  const keys = [null,accountA,accountB].flatMap(account => [1,2,3].map(slot => storageKey(account,slot)));
  assert.equal(new Set(keys).size,9);
  assert.throws(() => storageKey('invalid',1));
  assert.throws(() => storageKey(null,4));
});

function score({
  id = 'session', mode = 'weekly', level = 2, area = 'all', period = weekdays.at(-1),
  date = period + 'T12:00:00.000Z', correct = Infinity, wrongByArea = {}, assist = -1,
  interrupt = -1, skip = -1
} = {}) {
  const questions = makeSession({seed:0,mode,level,area});
  const remaining = {...wrongByArea};
  const responses = questions.map((q,i) => {
    const wrong = i >= correct || remaining[q.area] > 0;
    if (remaining[q.area] > 0) remaining[q.area]--;
    return {
      answer:i === skip ? null : wrong ? q.options.find(value => value !== q.answer) : q.answer,
      assisted:i === assist, interrupted:i === interrupt
    };
  });
  return summarize({id,mode,level,area,period,date,questions,responses});
}

test('scores correct, assisted, interrupted and missing answers by area', () => {
  const record = score({correct:7,assist:0,interrupt:8,skip:2});
  assert.equal(record.complete,false);
  assert.equal(record.correct,6);
  assert.equal(record.assisted,1);
  assert.equal(record.interrupted,1);
  const items = makeSession({seed:0,mode:'weekly',level:2,area:'all'});
  assert.equal(record.domains[items[0].area].assisted,1);
  assert.equal(score({correct:0}).complete,true);
  assert.equal(score().correct,12);
});

test('filters corrupt records and retains only recent validated fields', () => {
  const valid = score({id:'valid'});
  const malformed = [
    null, {}, {...valid,version:2}, {...valid,id:'<bad>'}, {...valid,date:'2026-02-30T00:00:00.000Z'},
    {...valid,period:'2026-11-17'}, {...valid,correct:-1}, {...valid,correct:2}, {...valid,complete:false},
    {...valid,area:'visual'}, {...valid,assisted:13}, {...valid,interrupted:0.5},
    {...valid,domains:{...valid.domains, visual:{total:2,correct:2,assisted:0}}}
  ];
  assert.deepEqual(cleanHistory([...malformed,{...valid,rawAnswer:'private'},valid]),[valid]);
  assert.deepEqual(cleanHistory({records:[valid]}),[]);
  const single = Array.from({length:153},(_, i) => score({
    id:'entry-'+i,date:new Date(Date.UTC(2026,10,16,0,i)).toISOString()
  }));
  const bound = cleanHistory(single);
  assert.equal(bound.length,150);
  assert.equal(bound[0].id,'entry-152');
  assert.equal(bound.at(-1).id,'entry-3');
});

test('weekly evidence excludes incomplete, assisted, interrupted, repeated and other-level work', () => {
  const first = score({id:'week1',period:weekdays[1],wrongByArea:{patterns:0,logic:1,visual:2,memory:2}});
  const repeat = score({id:'week1-repeat',period:weekdays[1],date:weekdays[1]+'T18:00:00.000Z'});
  const excluded = [
    score({id:'incomplete',skip:0}), score({id:'assisted',assist:0}),
    score({id:'interrupted',interrupt:4}), score({id:'other-level',level:1}),
    score({id:'daily',mode:'daily'}), score({id:'practice',mode:'practice',area:'visual'})
  ];
  for (const result of evidence([first,repeat,...excluded],2)) {
    assert.equal(result.sessions,1);
    assert.equal(result.status,'More evidence needed');
    assert.equal(result.pct,null);
  }
  const second = score({id:'week2',period:weekdays[2],wrongByArea:{patterns:1,logic:2,visual:2,memory:1}});
  const summary = evidence([second,repeat,first,...excluded],2);
  assert.deepEqual(summary.map(row => [row.area,row.pct,row.status]),[
    ['patterns',83,'Doing well'],['logic',50,'Developing'],['visual',33,'Needs more practice'],['memory',50,'Developing']
  ]);
  const supportedFirst = score({id:'supported-first',period:weekdays[3],assist:0});
  const independentRetry = score({id:'independent-retry',period:weekdays[3],date:weekdays[3]+'T18:00:00.000Z'});
  assert.ok(evidence([supportedFirst,independentRetry],2).every(row => row.sessions === 0));
  assert.equal(badges([supportedFirst,independentRetry]).find(badge => badge.id === 'weekly').earned,false);
  const sixWeeks = weekdays.map((period,index) => score({period,id:'distinct-'+index,correct:index === 0 ? 0 : Infinity}));
  assert.ok(evidence(sixWeeks,2).every(row => row.sessions === 5 && row.total === 15 && row.pct === 100));
});

test('suggests a level after two independent qualifying practices and caps movement', () => {
  const practice = (id, changes = {}) => score({id,mode:'practice',area:'visual',...changes});
  const newer = practice('new',{period:weekdays[5],correct:5});
  const older = practice('old',{period:weekdays[4],correct:6});
  assert.equal(suggestedLevel([older,newer],'visual',2),3);
  assert.equal(suggestedLevel([older,newer],'logic',2),2);
  assert.equal(suggestedLevel([older,practice('assist',{assist:0})],'visual',2),2);
  assert.equal(suggestedLevel([older,practice('interrupted',{interrupt:0})],'visual',2),2);
  assert.equal(suggestedLevel([older,practice('other',{level:1})],'visual',2),2);
  assert.equal(suggestedLevel([older,practice('medium',{correct:4})],'visual',2),2);
  assert.equal(suggestedLevel([practice('low1',{correct:3}),practice('low2',{correct:2})],'visual',2),1);
  assert.equal(suggestedLevel([practice('high1',{level:3}),practice('high2',{level:3})],'visual',2),3);
});

test('awards milestones only on completed matching activities', () => {
  const earned = history => badges(history).filter(badge => badge.earned).map(badge => badge.id);
  assert.deepEqual(earned([score({skip:0})]),[]);
  assert.deepEqual(earned([score({mode:'daily'})]),['explorer','four-areas']);
  assert.deepEqual(earned([score()]),['weekly']);
  assert.deepEqual(earned([score({interrupt:0})]),[]);
  assert.deepEqual(earned([score({mode:'practice',area:'visual',correct:5})]),['explorer','visual-2']);
  assert.deepEqual(earned([score({mode:'practice',area:'visual',assist:0})]),['explorer']);
});
