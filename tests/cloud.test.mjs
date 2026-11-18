import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {applySnapshot, cleanSnapshot, readSnapshot, snapshotEqual} from '../public/cloud-core.js';
import {cloudStatus, configureCloud, initializeCloud, enableCloud, replaceCloud, restoreCloud, syncNow, deleteCloud} from '../public/cloud-sync.js';
import {progressKeys} from '../public/auth-core.js';
import {profileKey} from '../public/child-profiles.js';
import {frenchKey} from '../public/french-engine.js';
import {handleProgress} from '../worker/progress.js';

const account = {id: '12345678-1234-1234-1234-123456789abc'};
const other = {id: '02345678-1234-1234-1234-123456789abc'};
const origin = 'https://reasonlab.example';
const blank = () => ({version: 1, profiles: {}, settings: {}, kids: [], adventures: {}, french: {}, indic: {}, vocabulary: {}});

function storage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
}

function harness() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0004_cloud_progress.sql', import.meta.url), 'utf8'));
  const env = {USAGE_DB: {prepare(sql) { return {
    bind(...args) {
      return {async first() {
        const query = db.prepare(sql);
        if (sql.includes('?1')) {
          return query.get(Object.fromEntries(args.map((value, index) => [String(index + 1), value]))) ?? null;
        }
        return query.get(...args) ?? null;
      }};
    }
  }; }}};
  async function auth(url, init) {
    assert.equal(String(url), 'https://krbuoncrksahcrnufprg.supabase.co/auth/v1/user');
    assert.equal(init.redirect, 'manual');
    const id = init.headers.Authorization === 'Bearer adult.two' ? other.id : account.id;
    if (init.headers.Authorization === 'Bearer denied') return Response.json({}, {status: 401});
    if (init.headers.Authorization === 'Bearer unavailable') throw Error('offline');
    return Response.json({id});
  }
  function call(method, data, extra = {}) {
    const headers = new Headers({Origin: origin, Authorization: 'Bearer adult.one', 'Sec-Fetch-Site': 'same-origin'});
    if (data !== undefined) headers.set('Content-Type', 'application/json');
    for (const [key, value] of Object.entries(extra)) headers.set(key, value);
    return handleProgress(new Request(origin + '/api/progress', {
      method, headers, body: data === undefined ? undefined : JSON.stringify(data)
    }), env, auth);
  }
  return {db, env, auth, call};
}

test('snapshot projects only expected fields, strips French and Indic drafts, and scopes storage by account', () => {
  const device = storage();
  device.setItem('reasonlab-auth-v1', 'secret');
  device.setItem(progressKeys().history, 'guest history');
  device.setItem(profileKey(other.id), 'other account');
  device.setItem(profileKey(account.id), JSON.stringify({1: {name: ' Bear ', avatar: 'fox', privateNote: 'secret'}}));
  device.setItem(frenchKey(account.id, 1), JSON.stringify({
    version: 1, lessons: {}, history: [{
      id: 'daily', date: 0, total: 1, correct: 0, assisted: 0,
      skills: {writing: {total: 1, correct: 0, assisted: 0, text: 'typed secret'}}
    }],
    journey: {version: 1, draft: {typed: 'typed secret'}}
  }));
  const data = readSnapshot(device, account.id);
  assert.deepEqual(data.french[1].history[0].skills, {writing: {total: 1, correct: 0, assisted: 0}});
  assert.equal(data.french[1].journey.draft, undefined);
  assert.equal(data.indic.ta[1].activity, undefined);
  assert.doesNotMatch(JSON.stringify(data), /secret|guest history|other account/);
  assert.equal(cleanSnapshot({...blank(), settings: []}), null);
  assert.throws(() => applySnapshot(device, null, data));
  applySnapshot(device, account.id, {...data, extraKey: 'ignored'});
  assert.equal(device.getItem('reasonlab-auth-v1'), 'secret');
  assert.equal(device.getItem(progressKeys().history), 'guest history');
  assert.equal(device.getItem(profileKey(other.id)), 'other account');
  assert(snapshotEqual(data, readSnapshot(device, account.id)));
});

test('a storage failure restores earlier keys during snapshot application', () => {
  const device = storage();
  const keys = progressKeys(account.id);
  device.setItem(profileKey(account.id), 'old learners');
  device.setItem(keys.settings, 'old preferences');
  const write = device.setItem;
  device.setItem = (key, value) => {
    if (key === keys.history) throw Error('storage quota');
    write(key, value);
  };
  assert.throws(() => applySnapshot(device, account.id, blank()), /quota/);
  assert.equal(device.getItem(profileKey(account.id)), 'old learners');
  assert.equal(device.getItem(keys.settings), 'old preferences');
});

test('progress verifies origin and authorization, rejects invalid or oversized input and uses server identity', async t => {
  const {db, call} = harness();
  t.after(() => db.close());
  assert.equal((await call('GET', undefined, {Origin: 'https://other.example'})).status, 403);
  assert.equal((await call('GET', undefined, {'Sec-Fetch-Site': 'same-site'})).status, 403);
  assert.equal((await call('GET', undefined, {Authorization: ''})).status, 401);
  assert.equal((await call('GET', undefined, {Authorization: 'Bearer denied'})).status, 401);
  assert.equal((await call('GET', undefined, {Authorization: 'Bearer unavailable'})).status, 503);
  assert.equal((await call('PUT', {revision: 0, data: blank()}, {'Content-Type': 'text/plain'})).status, 415);
  assert.equal((await call('PUT', {revision: 0, data: {version: 1}})).status, 400);
  assert.equal((await call('PUT', {revision: 0, data: {...blank(), extra: 'x'.repeat(256 * 1024)}})).status, 413);
  const created = await call('PUT', {revision: 0, data: blank(), user_id: other.id});
  assert.equal(created.status, 200);
  assert.equal(created.headers.get('Cache-Control'), 'no-store');
  assert.equal(created.headers.get('Access-Control-Allow-Origin'), null);
  assert.deepEqual(await (await call('GET', undefined, {Authorization: 'Bearer adult.two'})).json(), {revision: 0, data: null});
  assert.equal((await (await call('GET')).json()).revision, 1);
});

test('SQLite compare-and-set prevents stale writes and deletion retains a revision tombstone', async t => {
  const {db, call} = harness();
  t.after(() => db.close());
  assert.equal((await call('PUT', {revision: 7, data: blank()})).status, 409);
  assert.equal((await call('PUT', {revision: 0, data: blank()})).status, 200);
  const saves = await Promise.all([
    call('PUT', {revision: 1, data: blank()}), call('PUT', {revision: 1, data: blank()})
  ]);
  assert.deepEqual(saves.map(response => response.status).sort(), [200, 409]);
  assert.equal((await call('DELETE', {revision: 2})).status, 200);
  assert.deepEqual(await (await call('GET')).json(), {revision: 3, data: null});
  assert.equal((await call('PUT', {revision: 2, data: blank()})).status, 409);
  assert.equal((await call('PUT', {revision: 3, data: blank()})).status, 200);
});

test('cloud sync requires consent, keeps conflicting device progress, and stops uploads after deletion', async t => {
  const {db, auth, env} = harness();
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let device = storage();
  Object.defineProperty(globalThis, 'localStorage', {configurable: true, get: () => device});
  globalThis.fetch = (url, init) => {
    const headers = new Headers(init.headers);
    headers.set('Origin', origin);
    headers.set('Sec-Fetch-Site', 'same-origin');
    return handleProgress(new Request(origin + url, {...init, headers}), env, auth);
  };
  t.after(async () => {
    await initializeCloud(null);
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else delete globalThis.localStorage;
    db.close();
  });
  configureCloud({getToken: async id => {
    assert.equal(id, account.id);
    return 'adult.one';
  }});
  const first = device;
  await initializeCloud(account);
  assert.equal(cloudStatus(account).state, 'off');
  assert.equal(db.prepare('SELECT count(*) AS count FROM learning_progress').get().count, 0);
  assert.equal(await enableCloud(account), true);
  assert.equal(cloudStatus(account).state, 'synced');
  const second = storage();
  await initializeCloud(null);
  device = second;
  await initializeCloud(account);
  assert.equal(await enableCloud(account), false);
  assert.equal(cloudStatus(account).state, 'conflict');
  assert.equal(cloudStatus(account).enabled, true);
  assert.equal(await restoreCloud(account), true);
  const key = progressKeys(account.id).settings;
  second.setItem(key, JSON.stringify({grade: 2}));
  assert.equal(await syncNow(account), true);
  await initializeCloud(null);
  device = first;
  await initializeCloud(account);
  assert.equal(cloudStatus(account).state, 'synced');
  assert.deepEqual(readSnapshot(first, account.id).settings.kids, {grade: 2});
  await initializeCloud(null);
  device = second;
  await initializeCloud(account);
  second.setItem(key, JSON.stringify({grade: 4}));
  assert.equal(await syncNow(account), true);
  await initializeCloud(null);
  device = first;
  first.setItem(key, JSON.stringify({grade: 3}));
  await initializeCloud(account);
  assert.equal(cloudStatus(account).state, 'conflict');
  assert.deepEqual(readSnapshot(first, account.id).settings.kids, {grade: 3});
  assert.equal(await replaceCloud(account), true);
  assert.equal(await deleteCloud(account), true);
  assert.equal(cloudStatus(account).enabled, false);
  await initializeCloud(null);
  device = second;
  await initializeCloud(account);
  assert.equal(cloudStatus(account).state, 'conflict');
  assert.equal(await syncNow(account), false);
  assert.equal(db.prepare('SELECT payload FROM learning_progress').get().payload, null);
});

test('logging out before token retrieval finishes cancels the old account operation', async t => {
  const device = storage();
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: device});
  t.after(async () => {
    await initializeCloud(null);
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else delete globalThis.localStorage;
  });
  let giveToken, beginToken;
  const tokenStarted = new Promise(resolve => { beginToken = resolve; });
  configureCloud({getToken: () => {
    beginToken();
    return new Promise(resolve => { giveToken = resolve; });
  }});
  await initializeCloud(account);
  const pending = enableCloud(account);
  await tokenStarted;
  await initializeCloud(null);
  giveToken('adult.one');
  assert.equal(await pending, false);
  assert.equal(device.getItem('reasonlab-cloud:' + account.id), null);
});

test('anonymous Supabase identities cannot access adult cloud progress',async()=>{const response=await handleProgress(new Request('https://example.test/api/progress',{headers:{Origin:'https://example.test',Authorization:'Bearer anonymous'}}),{},async(_url,options)=>{assert.equal(options.redirect,'manual');return Response.json({id:'11111111-1111-4111-8111-111111111111',is_anonymous:true});});assert.equal(response.status,401);});
