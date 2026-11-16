import {progressKeys} from './auth-core.js';

export const areas = [
  {id:'patterns', name:'Patterns', icon:'🔢', description:'Find what changes and predict what comes next.', tip:'Compare one step with the next.', parentTip:'Ask your learner to say the rule before extending a sequence.'},
  {id:'logic', name:'Logic', icon:'🧩', description:'Put clues together and see what must be true.', tip:'Break each clue into one small decision.', parentTip:'Have your learner explain which clue rules out an option.'},
  {id:'visual', name:'Visual', icon:'🔷', description:'Spot repeats, turns, and reflections.', tip:'Pick a starting point and follow each change.', parentTip:'Try rotating an arrow drawn on scrap paper together.'},
  {id:'memory', name:'Memory', icon:'💭', description:'Notice the order, then recall what you saw.', tip:'Group nearby items or give the symbols names.', parentTip:'Try short turn-taking games that involve remembering an order.'}
];
export const levelNames = ['Discover', 'Build', 'Stretch'];

const areaIds = areas.map(area => area.id);
const sizes = new Map([['daily',5], ['weekly',12], ['practice',6]]);
const levels = [1,2,3];

function validArea(mode, area) {
  return mode === 'practice' ? areaIds.includes(area) : area === 'all';
}

export function seedFor(value) {
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
  return hash >>> 0;
}

function randomSource(seed) {
  return size => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let bits = Math.imul(seed ^ (seed >>> 15), seed | 1);
    bits ^= bits + Math.imul(bits ^ (bits >>> 7), bits | 61);
    return Math.floor(((bits ^ (bits >>> 14)) >>> 0) / 4294967296 * size);
  };
}

function shuffled(items, pick) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function question(prompt, visual, answer, choices, hint, explanation) {
  return {prompt, visual, answer:String(answer), options:choices.map(String), hint, explanation};
}

function numberQuestion(prompt, visual, answer, step, hint, explanation) {
  return question(prompt, visual, answer, [answer, answer - 1, answer + 1, answer + Math.max(2, step)], hint, explanation);
}

function countUp(pick, level) {
  const start = 2 + pick(6 * level);
  const step = 1 + level + pick(2 * level);
  const values = Array.from({length:4 + level}, (_, i) => start + i * step);
  const answer = values.at(-1);
  return numberQuestion('What number comes next?', [...values.slice(0,-1).map(String),'?'], answer, step,
    'Subtract the first number from the second. Check if the same change keeps happening.',
    'Each number is ' + step + ' more than the one before it. The next number is ' + answer + '.');
}

function twoSteps(pick, level) {
  const start = 2 + pick(8 * level);
  const small = 1 + pick(level + 1);
  const large = small + 2 + pick(level + 1);
  const values = [start, start + small, start + small + large, start + 2 * small + large, start + 2 * (small + large)];
  const answer = values.at(-1) + small;
  return numberQuestion('Which number continues the pattern?', [...values.map(String),'?'], answer, large,
    'Compare each pair of neighbours. Do the jumps take turns?',
    'The jumps alternate between +' + small + ' and +' + large + '. After ' + values.at(-1) + ', add ' + small + ' to get ' + answer + '.');
}

function growingSteps(pick, level) {
  const start = 1 + pick(7 * level);
  const growth = level;
  const first = 1 + pick(2 * level);
  const values = [start];
  for (let i = 0; i < 4; i++) values.push(values.at(-1) + first + i * growth);
  const jump = first + 4 * growth;
  const answer = values.at(-1) + jump;
  return numberQuestion('The jumps follow a rule. What comes next?', [...values.map(String),'?'], answer, jump,
    'Look at how the size of each jump changes.',
    'Each jump is ' + growth + ' bigger than the previous jump. The next jump is +' + jump + ', giving ' + answer + '.');
}

const names = ['Mia','Ravi','Zoe','Sam','Ivy','Noah','Kai','Lina','Omar','Asha'];
const shapes = ['●','▲','■','◆','★','✿','☀','♥'];
const arrows = ['↑','→','↓','←'];

function lineOrder(pick, level) {
  const order = shuffled(names, pick).slice(0, level + 3);
  const target = pick(order.length);
  const ordinals = ['first','second','third','fourth','fifth','sixth'];
  return question('Everyone faces the front. Who is ' + ordinals[target] + ' in line?',
    shuffled(order.slice(1).map((name, index) => order[index] + ' stands directly ahead of ' + name + '.'), pick),
    order[target], [order[target], ...shuffled(order.filter(name => name !== order[target]), pick).slice(0,3)],
    'Find who has nobody ahead of them. Then follow each directly-ahead clue.',
    'From front to back the order is ' + order.join(', ') + '. ' + order[target] + ' is ' + ordinals[target] + '.');
}

function groupRule(pick, level) {
  const people = shuffled(names, pick).slice(0,4);
  const symbols = shuffled(shapes, pick).slice(0,4);
  const target = pick(4);
  const pattern = pick(2) === 0;
  const rule = pattern ? 'A pass needs a ' : 'A pass must have a ';
  const simple = level === 1;
  const negative = level === 3;
  const tickets = people.map((person, index) => {
    const first = index === target || (!simple && index === (target + 1) % 4);
    const second = index === target || index === (target + 2) % 4;
    const ending = negative ? !second : second;
    return person + ' has ' + (first ? symbols[0] : symbols[2]) + ' ' + (ending ? symbols[1] : symbols[3]) + '.';
  });
  return question(rule + symbols[0] + (simple ? '.' : (negative ? ' and cannot have ' : ' and must also have ') + symbols[1] + '.') + ' Who has a pass?',
    tickets, people[target], people, 'Check every ticket against each part of the pass rule.',
    people[target] + ' is the only person whose ticket meets every rule.');
}

function exclusion(pick, level) {
  const people = shuffled(names, pick).slice(0, level + 3);
  const colours = shuffled(['red','blue','green','yellow','orange','purple'], pick).slice(0,people.length);
  const unknown = pick(people.length);
  const clues = people.flatMap((person, i) => i === unknown ? [] : [person + ' has the ' + colours[i] + ' key.']);
  return question('Each person has one key and each colour is used once. The colours are ' + colours.join(', ') + '. What colour key does ' + people[unknown] + ' have?',
    shuffled(clues, pick), colours[unknown], [colours[unknown], ...shuffled(colours.filter((_, i) => i !== unknown), pick).slice(0,3)],
    'Cross off each colour already named in the clues.',
    'Every other colour is taken, so ' + people[unknown] + ' has the ' + colours[unknown] + ' key.');
}

function repeatShapes(pick, level) {
  const available = shuffled(shapes, pick);
  const group = level === 1 ? available.slice(0,2) :
    level === 2 ? [available[0], available[1], available[1]] : [available[0], available[1], available[0], available[2]];
  const length = group.length * 2 + pick(group.length);
  const visual = Array.from({length}, (_, i) => group[i % group.length]);
  return question('What symbol continues the repeating pattern?', [...visual,'?'], group[length % group.length], available.slice(0,4),
    'Find the shortest group of symbols that repeats.',
    'The repeating group is ' + group.join(' ') + '. The next symbol is ' + group[length % group.length] + '.');
}

function turns(pick, level) {
  const start = pick(4);
  const step = level === 1 ? 1 : 2 + pick(2);
  const visual = Array.from({length:level + 2}, (_, i) => arrows[(start + i * step) % 4]);
  const answer = arrows[(start + visual.length * step) % 4];
  const rule = ['','a quarter-turn clockwise','a half-turn','a quarter-turn counterclockwise'][step];
  return question('The arrow turns by the same amount each time. Which arrow comes next?', [...visual,'?'], answer, arrows,
    'Compare two arrows and try making the same turn with your hand.',
    'Each arrow makes ' + rule + '. The next arrow points ' + answer + '.');
}

function mirror(pick, level) {
  const choices = shuffled(shapes, pick);
  const original = shuffled(choices.slice(0,4), pick).slice(0,level + 1);
  const selection = pick(original.length);
  const reflection = [...original].reverse();
  const answer = reflection[selection];
  return question('The symbols after the divider mirror the symbols before it. Which symbol fills the blank?',
    [...original,'│', ...reflection.map((symbol, i) => i === selection ? '?' : symbol)], answer, choices.slice(0,4),
    'Match positions the same distance from the divider on each side.',
    'The mirrored side reads ' + reflection.join(' ') + ', so the missing symbol is ' + answer + '.');
}

const ordinals = ['first','second','third','fourth','fifth','sixth','seventh','eighth'];

function recall(pick, level, type) {
  const symbols = type === 'symbol';
  const reverse = type === 'reverse';
  const pool = symbols ? shapes : Array.from({length:9}, (_, i) => String(i + 1));
  const size = (reverse ? 2 : 3) + level;
  const sequence = shuffled(pool, pick).slice(0,size);
  const index = pick(size);
  const place = ordinals[index];
  const answer = sequence[reverse ? size - 1 - index : index];
  const noun = symbols ? 'symbol' : 'digit';
  const distractors = shuffled(sequence.filter(item => item !== answer), pick);
  const alternatives = [...distractors, ...shuffled(pool.filter(item => !sequence.includes(item)), pick)].slice(0,3);
  return {
    ...question('Watch the sequence. Which ' + noun + ' was ' + place + (reverse ? ' from the end?' : ' from the beginning?'), [],
      answer, [answer,...alternatives],
      reverse ? 'Count backwards starting with the last digit.' : 'Say the items silently in order and count from the start.',
      'The sequence was ' + sequence.join(' ') + '. The ' + place + ' ' + noun + (reverse ? ' from the end' : ' from the beginning') + ' was ' + answer + '.'),
    memory:{stimulus:sequence.join(' '), durationMs:3000 + size * 400}
  };
}

const families = {
  patterns:[countUp,twoSteps,growingSteps],
  logic:[lineOrder,groupRule,exclusion],
  visual:[repeatShapes,turns,mirror],
  memory:[
    (pick, level) => recall(pick,level,'position'),
    (pick, level) => recall(pick,level,'reverse'),
    (pick, level) => recall(pick,level,'symbol')
  ]
};

export function makeSession({seed,mode,area,level}) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF || !sizes.has(mode) ||
      !validArea(mode,area) || !levels.includes(level)) throw new Error('Invalid session settings');
  const pick = randomSource(seed);
  const route = mode === 'practice' ? Array(6).fill(area) :
    Array.from({length:mode === 'weekly' ? 3 : 1}, () => shuffled(areaIds,pick)).flat();
  if (mode === 'daily') route.push(areaIds[pick(areaIds.length)]);
  const queues = Object.fromEntries(areaIds.map(id => [id,[]]));
  const used = new Set();
  return route.map((id, index) => {
    const queue = queues[id];
    if (!queue.length) queue.push(...shuffled([0,1,2],pick));
    const family = queue.shift();
    let item;
    let signature;
    do {
      item = families[id][family](pick,level);
      signature = JSON.stringify([item.prompt,item.visual,item.memory?.stimulus]);
    } while (used.has(signature));
    used.add(signature);
    return {...item,id:id+'-'+family+'-'+seed+'-'+index,area:id,level,options:shuffled(item.options,pick)};
  });
}

export function storageKey(userId,slot) {
  if (![1,2,3].includes(slot)) throw new Error('Invalid learner');
  return progressKeys(userId).history + ':adventure:' + slot;
}

export function defaultLevel(grade) {
  if (!Number.isInteger(grade) || grade < 1 || grade > 10) throw new Error('Invalid grade');
  return grade <= 3 ? 1 : grade <= 6 ? 2 : 3;
}

export function periodKey(mode,date = new Date()) {
  if (!sizes.has(mode) || !(date instanceof Date) || !Number.isFinite(date.getTime())) throw new Error('Invalid period');
  const day = new Date(date);
  if (mode === 'weekly') day.setDate(day.getDate() - (day.getDay() + 6) % 7);
  return [String(day.getFullYear()).padStart(4,'0'), String(day.getMonth()+1).padStart(2,'0'), String(day.getDate()).padStart(2,'0')].join('-');
}

export function summarize({id,mode,level,area,period,questions,responses,date = new Date()}) {
  const domains = Object.fromEntries(areaIds.map(key => [key,{total:0,correct:0,assisted:0}]));
  let correct = 0;
  let assisted = 0;
  let interrupted = 0;
  let answered = 0;
  questions.forEach((item,index) => {
    const response = responses[index];
    const domain = domains[item.area];
    domain.total++;
    if (item.options.includes(response?.answer)) {
      answered++;
      if (response.answer === item.answer) {
        domain.correct++;
        correct++;
      }
    }
    if (response?.assisted === true) {
      domain.assisted++;
      assisted++;
    }
    if (response?.interrupted === true) interrupted++;
  });
  const record = {
    version:1,id,mode,level,area,period,date:new Date(date).toISOString(),
    complete:answered === questions.length,total:questions.length,correct,assisted,interrupted,domains
  };
  if (!validRecord(record)) throw new Error('Invalid session record');
  return record;
}

function isCount(value,max) {
  return Number.isInteger(value) && value >= 0 && value <= max;
}

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validPeriod(mode, value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0,10) === value &&
    (mode !== 'weekly' || day.getUTCDay() === 1);
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

function validRecord(record) {
  if (!plainObject(record)) return false;
  const {version,id,mode,level,area,period,date,complete,total,correct,assisted,interrupted,domains} = record;
  if (version !== 1 || typeof id !== 'string' || !/^[a-zA-Z0-9:_-]{1,128}$/.test(id) ||
      !sizes.has(mode) || !levels.includes(level) || !validArea(mode,area) ||
      !validPeriod(mode,period) || !validDate(date) || typeof complete !== 'boolean' ||
      sizes.get(mode) !== total || !isCount(correct,total) || !isCount(assisted,total) ||
      !isCount(interrupted,total) || (!complete && correct === total) ||
      !plainObject(domains) || Object.keys(domains).length !== areaIds.length) return false;

  const entries = areaIds.map(key => domains[key]);
  const countsAreValid = entries.every((domain,i) => {
    if (!plainObject(domain)) return false;
    const {total,correct,assisted} = domain;
    const expected = mode === 'practice' ? (areaIds[i] === area ? [6] : [0]) :
      mode === 'weekly' ? [3] : [1,2];
    return expected.includes(total) && isCount(correct,total) && isCount(assisted,total);
  });
  return countsAreValid && ['total','correct','assisted'].every(key =>
    entries.reduce((sum,domain) => sum + domain[key],0) === record[key]);
}

export function cleanHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw.filter(validRecord).sort((a,b) => b.date.localeCompare(a.date)).filter(record => {
    if (seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  }).slice(0,150).map(record => {
    const {version,id,mode,level,area,period,date,complete,total,correct,assisted,interrupted,domains} = record;
    const safeDomains = Object.fromEntries(areaIds.map(key => {
      const {total,correct,assisted} = domains[key];
      return [key,{total,correct,assisted}];
    }));
    return {version,id,mode,level,area,period,date,complete,total,correct,assisted,interrupted,domains:safeDomains};
  });
}

function independent(record) {
  return record.complete && record.assisted === 0 && record.interrupted === 0;
}

function firstWeeklyAttempts(records) {
  const weeks = new Map();
  for (const record of records) {
    if (record.mode === 'weekly' && record.complete) {
      weeks.set(record.period + ':' + record.level,record);
    }
  }
  return [...weeks.values()].sort((a,b) => b.period.localeCompare(a.period));
}

export function evidence(history,level) {
  const weekly = firstWeeklyAttempts(cleanHistory(history))
    .filter(record => record.level === level && independent(record)).slice(0,5);
  return areaIds.map(area => {
    const total = weekly.reduce((sum,record) => sum + record.domains[area].total,0);
    const correct = weekly.reduce((sum,record) => sum + record.domains[area].correct,0);
    const sessions = weekly.length;
    const pct = sessions >= 2 && total >= 6 ? Math.round(correct * 100 / total) : null;
    const status = pct === null ? 'More evidence needed' : correct * 100 >= total * 80 ? 'Doing well' :
      correct * 100 >= total * 50 ? 'Developing' : 'Needs more practice';
    return {area,total,correct,sessions,status,pct};
  });
}

export function suggestedLevel(history,area,fallback) {
  if (!areaIds.includes(area) || !levels.includes(fallback)) throw new Error('Invalid practice selection');
  const recent = cleanHistory(history).filter(record =>
    record.mode === 'practice' && record.area === area && record.complete).slice(0,2);
  if (recent.length < 2 || recent[0].level !== recent[1].level || !recent.every(independent)) return fallback;
  const {level} = recent[0];
  if (recent.every(record => record.correct * 100 >= record.total * 80)) return Math.min(3,level + 1);
  if (recent.every(record => record.correct * 100 <= record.total * 50)) return Math.max(1,level - 1);
  return fallback;
}

export function badges(history) {
  const complete = cleanHistory(history).filter(record => record.complete);
  const practiced = complete.filter(record => record.mode === 'practice' || record.mode === 'daily');
  return [
    {id:'explorer',title:'First Steps',earned:practiced.length > 0,
      description:'Finish your first Daily Trail or Skill Practice.'},
    {id:'four-areas',title:'Four Corners',earned:areaIds.every(id => practiced.some(record => record.domains[id].total > 0)),
      description:'Try all four skills in completed Daily Trails or Skill Practice.'},
    {id:'weekly',title:'Weekly Explorer',earned:firstWeeklyAttempts(complete).some(independent),
      description:'Finish a Weekly Check-In on your own.'},
    ...areas.flatMap(area => levels.map(level => ({
      id:area.id+'-'+level,title:area.name + ' · ' + levelNames[level-1],
      earned:complete.some(record => record.mode === 'practice' && record.area === area.id &&
        record.level === level && independent(record) && record.correct * 100 >= record.total * 80),
      description:'Answer at least 80% correctly on your own in ' + area.name + ' at ' + levelNames[level-1] + '.'
    })))
  ];
}
