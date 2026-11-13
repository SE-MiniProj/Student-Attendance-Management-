// Who is signed in. The token lives in localStorage so a page refresh keeps
// the user signed in until the JWT expires (24 h, set by the server).
import { api, configureApi, tokenExpiry } from './api.js';

const KEY = 'sams.session';
const FLASH = 'sams.flash';

let current = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved?.token) return null;
    const exp = tokenExpiry(saved.token);
    return exp !== null && exp * 1000 <= Date.now() ? null : saved;
  } catch {
    return null;
  }
}

function save(next) {
  current = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch { /* storage unavailable: the session just lasts until reload */ }
}

export const session = {
  get user() { return current; },
  get isSignedIn() { return current !== null; },
  hasRole: (...roles) => current !== null && roles.includes(current.role),

  async signIn(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    save({ token: res.token, role: res.role, userId: res.userId, fullName: res.fullName });
    return current;
  },

  signOut() { save(null); },

  /** A one-time message to show on the login screen after a redirect. */
  setFlash(message) { try { sessionStorage.setItem(FLASH, message); } catch { /* ignore */ } },
  takeFlash() {
    try {
      const message = sessionStorage.getItem(FLASH);
      sessionStorage.removeItem(FLASH);
      return message;
    } catch { return null; }
  },
};

configureApi({
  getToken: () => current?.token ?? null,
  onSessionExpired: () => {
    if (!current) return;
    save(null);
    session.setFlash('Your session ended. Please sign in again.');
    window.location.hash = '#/login';
  },
});
