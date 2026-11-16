import { demoRequest } from './demo';

const DEMO_KEY = 'acq-demo-mode';
const USER_KEY = 'acq-user';

export const isDemoForced = () => {
  try {
    return localStorage.getItem(DEMO_KEY) === '1';
  } catch {
    return false;
  }
};

export const setDemoForced = on => {
  try {
    if (on) localStorage.setItem(DEMO_KEY, '1');
    else localStorage.removeItem(DEMO_KEY);
  } catch {}
};

// The API keeps the JWT in an httpOnly cookie and has no /me endpoint,
// so the user returned by sign-in / sign-up is cached for the UI only.
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const storeUser = user => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {}
};

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

const listeners = new Set();
export const onSourceChange = fn => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const setSource = source => listeners.forEach(fn => fn(source));

export async function request(method, path, body) {
  let result = null;

  if (!isDemoForced()) {
    try {
      const res = await fetch(path, {
        method,
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const type = res.headers.get('content-type') || '';
      // A non-JSON 5xx means the Next proxy could not reach Express at all.
      if (res.status >= 500 && !type.includes('json')) throw new Error('unreachable');
      const data = type.includes('json') ? await res.json() : { message: await res.text() };
      result = { status: res.status, body: data };
      setSource('api');
    } catch {
      result = null;
    }
  }

  if (!result) {
    setSource('demo');
    await new Promise(r => setTimeout(r, 250));
    result = demoRequest(method, path, body || {}, getStoredUser());
  }

  if (result.status >= 400) throw new ApiError(result.status, result.body);
  return result.body;
}

export const api = {
  health: () => request('GET', '/health'),
  signUp: data => request('POST', '/api/auth/sign-up', data),
  signIn: data => request('POST', '/api/auth/sign-in', data),
  signOut: () => request('POST', '/api/auth/sign-out'),
  users: () => request('GET', '/api/users'),
  updateUser: (id, data) => request('PUT', `/api/users/${id}`, data),
  deleteUser: id => request('DELETE', `/api/users/${id}`),
};
