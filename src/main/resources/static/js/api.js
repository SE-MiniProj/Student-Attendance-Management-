// Thin fetch wrapper around the REST API.
//  - attaches the JWT as a Bearer token
//  - turns RFC 7807 problem responses into ApiError objects
//  - tells the app when the session is no longer valid
//
// Spring answers an unauthenticated request with an *empty* 403 (the filter
// chain rejects it before any controller runs), whereas a role check that
// fails inside a controller produces a JSON problem body. We use that
// difference to tell "your session ended" apart from "you may not do this".

export class ApiError extends Error {
  constructor(status, detail, fieldErrors = null) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.fieldErrors = fieldErrors;   // { fieldName: message } for 400 validation errors
  }

  /** One readable sentence, including per-field validation messages. */
  get readable() {
    if (this.fieldErrors && Object.keys(this.fieldErrors).length) {
      return Object.entries(this.fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('; ');
    }
    return this.detail;
  }
}

let hooks = {
  getToken: () => null,
  onSessionExpired: () => {},
};

/** Called once by the session module. */
export function configureApi(next) {
  hooks = { ...hooks, ...next };
}

/** Reads the `exp` claim (seconds) from a JWT without verifying it. */
export function tokenExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).exp ?? null;
  } catch {
    return null;
  }
}

function isExpired(token) {
  const exp = tokenExpiry(token);
  return exp !== null && exp * 1000 <= Date.now();
}

function buildUrl(path, params) {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  }
  return url.pathname + url.search;
}

async function readBody(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function request(method, path, { params, json, form } = {}) {
  const isLogin = path === '/api/auth/login';
  const token = isLogin ? null : hooks.getToken();

  if (token && isExpired(token)) {
    hooks.onSessionExpired();
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form;                       // the browser sets the multipart boundary
  }

  let response;
  try {
    response = await fetch(buildUrl(path, params), { method, headers, body });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  const data = await readBody(response);
  if (response.ok) return data;

  const problem = data && typeof data === 'object' ? data : null;

  if (!isLogin && token && (response.status === 401 || (response.status === 403 && !problem))) {
    hooks.onSessionExpired();
    throw new ApiError(response.status, 'Your session has ended. Please sign in again.');
  }

  throw new ApiError(
    response.status,
    problem?.detail || problem?.message || fallbackMessage(response.status),
    problem?.errors || null,
  );
}

function fallbackMessage(status) {
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'That item no longer exists.';
  if (status >= 500) return 'The server ran into a problem. Please try again.';
  return `Request failed (${status}).`;
}

export const api = {
  get:    (path, params)       => request('GET', path, { params }),
  post:   (path, json)         => request('POST', path, { json }),
  put:    (path, json)         => request('PUT', path, { json }),
  patch:  (path, json)         => request('PATCH', path, { json }),
  delete: (path, json)         => request('DELETE', path, { json }),
  upload: (path, form, params) => request('POST', path, { form, params }),
};
