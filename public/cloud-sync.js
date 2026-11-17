import {progressKeys} from './auth-core.js';
import {applySnapshot, cleanSnapshot, readSnapshot, snapshotString} from './cloud-core.js';

let getToken;
let active;
let timer;
let footerStatus;
const off = {enabled: false, state: 'off', message: 'Cloud progress is off on this device.'};
const metaKey = id => 'reasonlab-cloud:' + id;

export function configureCloud(config) {
  getToken = config.getToken;
  if (timer || typeof document === 'undefined') return;
  timer = setInterval(() => {
    if (!document.hidden && active?.meta.enabled && !active.pending) void checkLocalChanges(active);
  }, 4000);
}

function updateFooter(status) {
  if (typeof document === 'undefined' || location.pathname === '/account.html') return;
  if (status.enabled && !footerStatus) {
    const footer = document.querySelector('footer');
    if (!footer) return;
    footerStatus = document.createElement('span');
    const message = document.createElement('span');
    message.setAttribute('role', 'status');
    const link = document.createElement('a');
    link.href = '/account.html';
    link.textContent = 'Cloud settings';
    link.addEventListener('click', event => { const account = document.querySelector('#account-link'); if (account && account !== link) { event.preventDefault(); account.click(); } });
    footerStatus.append(message, ' · ', link);
    footer.append(footerStatus);
  }
  if (!footerStatus) return;
  footerStatus.hidden = !status.enabled;
  footerStatus.firstElementChild.textContent = status.message;
}

async function checkLocalChanges(context) {
  let hash;
  try {
    if (!readMeta(context.id).enabled) {
      context.meta = {enabled: false, revision: 0, digest: null};
      context.conflict = false;
      setStatus(context, off.state, off.message);
      return;
    }
    if (context.conflict || Date.now() < (context.retryAt || 0)) return;
    hash = await digest(readLocal(context));
    current(context);
  } catch {
    setStatus(context, 'error', 'Cloud progress could not be checked. Your progress is still on this device.');
    return;
  }
  if (!context.pending && (hash !== context.meta.digest || context.status.state === 'error')) {
    await syncNow({id: context.id});
  }
}

function readMeta(id) {
  try {
    const meta = JSON.parse(localStorage.getItem(metaKey(id)));
    if (meta?.enabled === true && Number.isSafeInteger(meta.revision) && meta.revision >= 0 &&
        (meta.digest === null || (typeof meta.digest === 'string' && /^[a-f0-9]{64}$/.test(meta.digest)))) return meta;
  } catch { /* Local practice remains available if cloud metadata cannot be read. */ }
  return {enabled: false, revision: 0, digest: null};
}

function setStatus(context, state, message) {
  if (active !== context) return;
  const enabled = context.meta.enabled;
  if (context.status.enabled === enabled && context.status.state === state && context.status.message === message) return;
  context.status = {enabled, state, message};
  updateFooter(context.status);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('reasonlab-cloud-change'));
}

function saveMeta(context, meta) {
  current(context);
  if (meta.enabled) localStorage.setItem(metaKey(context.id), JSON.stringify(meta));
  else localStorage.removeItem(metaKey(context.id));
  context.meta = meta;
}

function current(context) {
  if (active !== context || context.controller.signal.aborted) throw Error('Account changed');
}

export function cloudStatus(user) {
  if (user?.id && active?.id === user.id) return {...active.status};
  return {...off};
}

async function digest(data) {
  const input = new TextEncoder().encode(snapshotString(data));
  const hash = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
}

async function request(context, method, body) {
  current(context);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  context.controller.signal.addEventListener('abort', cancel, {once: true});
  const timeout = setTimeout(cancel, 10000);
  let rejectAbort;
  const aborted = new Promise((_, reject) => { rejectAbort = () => reject(Error('Request interrupted')); });
  controller.signal.addEventListener('abort', rejectAbort, {once: true});
  try {
    const operation = async () => {
      const token = await getToken(context.id);
      current(context);
      if (!token || controller.signal.aborted) throw Error('Sign in required');
      const headers = {Authorization: 'Bearer ' + token};
      if (body) headers['Content-Type'] = 'application/json';
      const response = await fetch('/api/progress', {
        method, headers, credentials: 'omit', mode: 'same-origin', redirect: 'error',
        cache: 'no-store', body: body ? JSON.stringify(body) : undefined, signal: controller.signal
      });
      current(context);
      if (response.status === 409) return null;
      if (response.status === 413) throw Error('Progress exceeds the cloud storage limit.');
      if (!response.ok) throw Error('Cloud progress is unavailable.');
      const result = await response.json();
      if (!Number.isSafeInteger(result?.revision) || result.revision < 0) {
        throw Error('Invalid cloud response');
      }
      if (method === 'GET' && result.data !== null) {
        result.data = cleanSnapshot(result.data);
        if (!result.data) throw Error('Invalid cloud progress');
      }
      return result;
    };
    return await Promise.race([operation(), aborted]);
  } finally {
    clearTimeout(timeout);
    controller.signal.removeEventListener('abort', rejectAbort);
    context.controller.signal.removeEventListener('abort', cancel);
  }
}

function conflict(context, deleted = false) {
  context.conflict = deleted ? 'deleted' : 'changed';
  setStatus(context, 'conflict', deleted
    ? 'Cloud progress was deleted. This device’s progress is still here. Choose whether to replace the cloud copy.'
    : 'Cloud progress changed. Open the account page to choose which progress to keep.');
}

function synced(context, revision, hash) {
  saveMeta(context, {enabled: true, revision, digest: hash});
  context.conflict = false;
  context.retryAt = 0;
  setStatus(context, 'synced', 'Cloud progress is up to date.');
}

function run(user, action, enqueue = true) {
  const context = active;
  if (!user?.id || context?.id !== user.id) return Promise.resolve(false);
  if (context.pending) {
    if (!enqueue) return context.pending;
    return context.pending.then(() => run(user, action));
  }
  context.pending = Promise.resolve().then(async () => {
    try {
      setStatus(context, 'saving', 'Checking cloud progress…');
      return await action(context);
    } catch (error) {
      context.retryAt = Date.now() + 20000;
      const message = error?.message === 'Progress exceeds the cloud storage limit.'
        ? 'Progress exceeds the cloud storage limit. Your progress is still on this device.'
        : 'Cloud progress could not be updated. Your progress is still on this device.';
      setStatus(context, context.conflict ? 'conflict' : 'error', message);
      return false;
    } finally {
      context.pending = null;
    }
  });
  return context.pending;
}

export async function initializeCloud(user) {
  const id = user?.id;
  if (id && active?.id === id) return active.initialization;
  active?.controller.abort();
  active = undefined;
  updateFooter(off);
  if (!id || !getToken || typeof localStorage === 'undefined') return;
  try { progressKeys(id); }
  catch { return; }
  const meta = readMeta(id);
  active = {id, meta, controller: new AbortController(), status: {...off}};
  if (meta.enabled) {
    active.initialization = run(user, context => check(context, true));
    await active.initialization;
  }
}

function readLocal(context) {
  current(context);
  return readSnapshot(localStorage, context.id);
}

async function upload(context, remote, data, hash) {
  const result = await request(context, 'PUT', {revision: remote.revision, data});
  if (!result) {
    conflict(context);
    return false;
  }
  synced(context, result.revision, hash);
  return true;
}

async function check(context, beforePageLoad = false) {
  if (!context.meta.enabled || !readMeta(context.id).enabled) {
    context.meta = {enabled: false, revision: 0, digest: null};
    context.conflict = false;
    setStatus(context, off.state, off.message);
    return false;
  }
  if (context.conflict) {
    conflict(context, context.conflict === 'deleted');
    return false;
  }
  const remote = await request(context, 'GET');
  const local = readLocal(context);
  const hash = await digest(local);
  const {revision, digest: base} = context.meta;
  if (!readMeta(context.id).enabled) {
    context.meta = readMeta(context.id);
    setStatus(context, off.state, off.message);
    return false;
  }
  if (revision === remote.revision) {
    if (base === hash) {
      context.retryAt = 0;
      setStatus(context, 'synced', 'Cloud progress is up to date.');
      return true;
    }
    return upload(context, remote, local, hash);
  }
  if (remote.data === null) {
    conflict(context, remote.revision > 0);
    return false;
  }
  const remoteHash = await digest(remote.data);
  current(context);
  if (hash === remoteHash) {
    synced(context, remote.revision, hash);
    return true;
  }
  if (beforePageLoad && hash === base && snapshotString(local) === snapshotString(readLocal(context))) {
    applySnapshot(localStorage, context.id, remote.data, {preserveDrafts: true});
    synced(context, remote.revision, remoteHash);
    return true;
  }
  conflict(context);
  return false;
}

export function syncNow(user) {
  return run(user, context => check(context), false);
}

export function enableCloud(user) {
  return run(user, async context => {
    if (context.meta.enabled) return check(context);
    const remote = await request(context, 'GET');
    if (remote.data !== null || remote.revision !== 0) {
      saveMeta(context, {enabled: true, revision: 0, digest: null});
      conflict(context, remote.data === null);
      return false;
    }
    const data = readLocal(context);
    return upload(context, remote, data, await digest(data));
  });
}

export function restoreCloud(user) {
  return run(user, async context => {
    if (!context.meta.enabled) return false;
    const local = readLocal(context);
    const remote = await request(context, 'GET');
    if (!remote.data || snapshotString(local) !== snapshotString(readLocal(context))) {
      conflict(context, remote.revision > 0 && remote.data === null);
      return false;
    }
    const hash = await digest(remote.data);
    if (snapshotString(local) !== snapshotString(readLocal(context))) {
      conflict(context);
      return false;
    }
    applySnapshot(localStorage, context.id, remote.data);
    synced(context, remote.revision, hash);
    return true;
  });
}

export function replaceCloud(user) {
  return run(user, async context => {
    if (!context.meta.enabled) return false;
    const remote = await request(context, 'GET');
    const data = readLocal(context);
    return upload(context, remote, data, await digest(data));
  });
}

export function disableCloud(user) {
  return run(user, context => {
    saveMeta(context, {enabled: false, revision: 0, digest: null});
    context.conflict = false;
    setStatus(context, off.state, off.message);
    return true;
  });
}

export function deleteCloud(user) {
  return run(user, async context => {
    const remote = await request(context, 'GET');
    const result = await request(context, 'DELETE', {revision: remote.revision});
    if (!result) {
      conflict(context);
      return false;
    }
    saveMeta(context, {enabled: false, revision: 0, digest: null});
    context.conflict = false;
    setStatus(context, 'off', 'Cloud copy deleted. This device still has its progress.');
    return true;
  });
}
