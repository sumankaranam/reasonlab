import {authConfig} from '../public/auth-config.js';
import {cleanSnapshot} from '../public/cloud-core.js';

const maxBytes = 256 * 1024;
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};
const json = (status, body) => Response.json(body, {status, headers});
const error = (status, message) => json(status, {error: message});

async function readBody(request) {
  if (Number(request.headers.get('Content-Length')) > maxBytes) return {status: 413};
  const reader = request.body?.getReader();
  if (!reader) return {status: 400};
  const bytes = new Uint8Array(maxBytes);
  let offset = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      if (offset + value.length > maxBytes) {
        await reader.cancel();
        return {status: 413};
      }
      bytes.set(value, offset);
      offset += value.length;
    }
    return {value: JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes.subarray(0, offset)))};
  } catch {
    return {status: 400};
  } finally {
    reader.releaseLock();
  }
}

export async function handleProgress(request, env, fetcher = fetch) {
  const method = request.method;
  if (!['GET', 'PUT', 'DELETE'].includes(method)) return error(405, 'Method not allowed');
  const origin = request.headers.get('Origin');
  const site = request.headers.get('Sec-Fetch-Site');
  const sameOrigin = new URL(request.url).origin;
  if ((origin && origin !== sameOrigin) || (site && site !== 'same-origin') ||
      (method === 'GET' ? !origin && !site : origin !== sameOrigin)) {
    return error(403, 'Same-origin request required');
  }
  const authorization = request.headers.get('Authorization');
  if (!authorization || !/^Bearer [A-Za-z0-9._-]{1,8192}$/.test(authorization)) {
    return error(401, 'Sign in required');
  }
  let user;
  try {
    const response = await fetcher(new URL('/auth/v1/user', authConfig.url), {
      headers: {Authorization: authorization, apikey: authConfig.publishableKey},
      redirect: 'error',
      signal: AbortSignal.timeout(8000)
    });
    if ([400, 401, 403].includes(response.status)) return error(401, 'Sign in required');
    if (!response.ok) return error(503, 'Sign-in verification unavailable');
    user = await response.json();
  } catch {
    return error(503, 'Sign-in verification unavailable');
  }
  if (typeof user?.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
    return error(503, 'Sign-in verification unavailable');
  }

  if(user.is_anonymous === true)return error(401, 'Adult sign-in required');

  let revision, payload;
  if (method !== 'GET') {
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return error(415, 'JSON required');
    }
    const body = await readBody(request);
    if (body.status) return error(body.status, 'Invalid progress request');
    revision = body.value?.revision;
    if (!Number.isSafeInteger(revision) || revision < 0 || revision === Number.MAX_SAFE_INTEGER) {
      return error(400, 'Invalid progress revision');
    }
    if (method === 'PUT') {
      const data = cleanSnapshot(body.value?.data);
      if (!data) return error(400, 'Invalid progress snapshot');
      payload = JSON.stringify(data);
      if (new TextEncoder().encode(payload).length > maxBytes) return error(413, 'Progress snapshot too large');
    } else payload = null;
  }

  const userId = user.id.toLowerCase();
  try {
    if (method === 'GET') {
      const row = await env.USAGE_DB.prepare(
        'SELECT revision, payload FROM learning_progress WHERE user_id = ?'
      ).bind(userId).first();
      return json(200, {revision: row?.revision ?? 0, data: row?.payload == null ? null : JSON.parse(row.payload)});
    }
    const row = await env.USAGE_DB.prepare(`
      INSERT INTO learning_progress (user_id, revision, payload, updated_at)
      SELECT ?1, ?2 + 1, ?3, ?4
      WHERE ?2 = 0 OR EXISTS (
        SELECT 1 FROM learning_progress WHERE user_id = ?1 AND revision = ?2
      )
      ON CONFLICT(user_id) DO UPDATE SET
        revision = excluded.revision, payload = excluded.payload, updated_at = excluded.updated_at
      WHERE learning_progress.revision = ?2
      RETURNING revision
    `).bind(userId, revision, payload, new Date().toISOString()).first();
    return row ? json(200, {revision: row.revision}) : error(409, 'Cloud progress changed');
  } catch {
    return error(503, 'Cloud progress unavailable');
  }
}
