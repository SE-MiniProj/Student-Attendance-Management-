// Hash-based router: '#/admin/courses?x=1' -> route '/admin/courses'.
// Pages register themselves in routes.js. The router handles guards (signed in?
// right role?), renders the page, and drops results that arrive after the
// user has already navigated somewhere else.
import { h } from './dom.js';
import { session } from './session.js';
import { routes } from './routes.js';

let navToken = 0;

export function currentPath() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  return raw.split('?')[0] || '/';
}

export function currentQuery() {
  const raw = window.location.hash.replace(/^#/, '');
  return new URLSearchParams(raw.includes('?') ? raw.split('?')[1] : '');
}

export function navigate(path) {
  const target = `#${path}`;
  if (window.location.hash === target) handleRoute();   // same hash: hashchange won't fire
  else window.location.hash = target;
}

/** Routes a signed-in user's role may open, in registry order. */
export function visibleRoutes() {
  return routes.filter((r) => r.nav && (!r.roles || session.hasRole(...r.roles)));
}

function home() {
  return routes.find((r) => r.path === '/') ? '/' : visibleRoutes()[0]?.path ?? '/login';
}

let show = () => {};

/** `present(route, contentPromise)` draws the page (inside the app shell, or bare for login). */
export function startRouter(present) {
  show = present;
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

async function handleRoute() {
  const path = currentPath();
  const token = ++navToken;

  if (!session.isSignedIn && path !== '/login') return navigate('/login');
  if (session.isSignedIn && path === '/login') return navigate(home());
  if (path === '/' && !routes.some((r) => r.path === '/')) return navigate(home());

  const route = routes.find((r) => r.path === path);
  if (!route) return present(token, notFound, Promise.resolve(emptyPage('Page not found', 'That address does not match any page. Use the menu to get back on track.')));
  if (route.roles && !session.hasRole(...route.roles)) {
    return present(token, route, Promise.resolve(emptyPage('Not available for your role', 'Ask an administrator if you think you should have access to this page.')));
  }

  document.title = `${route.title} – SAMS`;
  const ctx = { query: currentQuery(), user: session.user };
  present(token, route, Promise.resolve().then(() => route.render(ctx)));
}

const notFound = { path: '/404', title: 'Not found' };

async function present(token, route, contentPromise) {
  let content;
  try {
    content = await contentPromise;
  } catch (err) {
    content = emptyPage('Could not load this page', err?.readable || err?.message || 'Something went wrong.', true);
  }
  if (token !== navToken) return;       // user already moved on
  show(route, content);
}

function emptyPage(title, message, retry = false) {
  return h('section', { class: 'empty-state' },
    h('h1', null, title),
    h('p', { class: 'muted' }, message),
    retry && h('button', { class: 'btn', type: 'button', onclick: () => navigate(currentPath()) }, 'Try again'),
  );
}
