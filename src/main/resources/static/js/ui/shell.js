// The signed-in frame: sidebar (role-aware), top bar for small screens, and the
// <main> region that pages render into.
import { h, replaceChildren, initials } from '../dom.js';
import { icon } from './icons.js';
import { session } from '../session.js';
import { visibleRoutes, navigate } from '../router.js';

const ROLE_LABEL = { ADMIN: 'Administrator', TEACHER: 'Teacher', STUDENT: 'Student' };
const GROUP_ORDER = ['', 'Attendance', 'Administration'];

let parts = null;   // { root, main, sidebar, scrim, toggle, links: Map(path -> <a>) }

function brand() {
  return h('a', { class: 'brand', href: '#/' },
    h('img', { src: '/favicon.svg', alt: '', width: 28, height: 28 }), 'SAMS');
}

function buildNav() {
  const links = new Map();
  const grouped = new Map();
  for (const route of visibleRoutes()) {
    const group = route.nav.group || '';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group).push(route);
  }
  const groups = [...grouped.keys()].sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));

  const nav = h('nav', { class: 'nav', 'aria-label': 'Main' },
    groups.map((group) => {
      const items = grouped.get(group).sort((a, b) => (a.nav.order ?? 50) - (b.nav.order ?? 50));
      const id = `nav-${group || 'home'}`.replace(/\s+/g, '-').toLowerCase();
      return h('div', { class: 'nav-group', role: 'group', 'aria-labelledby': group ? id : null },
        group && h('p', { class: 'nav-heading', id }, group),
        items.map((route) => {
          const a = h('a', { class: 'nav-link', href: `#${route.path}` }, icon(route.nav.icon || 'dashboard'), h('span', null, route.nav.label));
          links.set(route.path, a);
          return a;
        }),
      );
    }),
  );
  return { nav, links };
}

function build() {
  const user = session.user;
  const { nav, links } = buildNav();

  const toggle = h('button', { class: 'icon-btn menu-btn', type: 'button', 'aria-label': 'Open menu', 'aria-expanded': 'false', 'aria-controls': 'sidebar',
    onclick: () => setDrawer(!document.body.classList.contains('drawer-open')) }, icon('menu', 22));
  const scrim = h('div', { class: 'scrim', onclick: () => setDrawer(false) });

  const sidebar = h('aside', { class: 'sidebar', id: 'sidebar' },
    h('div', { class: 'sidebar-head' }, brand(),
      h('button', { class: 'icon-btn close-btn', type: 'button', 'aria-label': 'Close menu', onclick: () => setDrawer(false) }, icon('close', 20))),
    nav,
    h('div', { class: 'sidebar-foot' },
      h('div', { class: 'avatar', 'aria-hidden': 'true' }, initials(user.fullName)),
      h('div', { class: 'who' }, h('strong', null, user.fullName), h('span', { class: 'small muted' }, ROLE_LABEL[user.role] || user.role)),
      h('button', { class: 'icon-btn', type: 'button', title: 'Sign out', 'aria-label': 'Sign out',
        onclick: () => { session.signOut(); navigate('/login'); } }, icon('logout', 20)),
    ),
  );

  const main = h('main', { class: 'main', id: 'main', tabindex: '-1' });
  const root = h('div', { class: 'shell' },
    sidebar, scrim,
    h('div', { class: 'main-col' }, h('header', { class: 'topbar' }, toggle, brand()), main),
  );
  return { root, main, sidebar, scrim, toggle, links };
}

function setDrawer(open) {
  document.body.classList.toggle('drawer-open', open);
  parts?.toggle.setAttribute('aria-expanded', String(open));
  if (open) parts?.sidebar.querySelector('.nav-link')?.focus();
  else if (parts && document.activeElement && parts.sidebar.contains(document.activeElement)) parts.toggle.focus();
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

export const shell = {
  /** Show `content` for `route`, building the frame first if it is not on screen. */
  show(app, route, content) {
    if (!parts || !app.contains(parts.root)) {
      parts = build();
      replaceChildren(app, parts.root);
    }
    for (const [path, a] of parts.links) {
      if (path === route.path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
    parts.main.removeAttribute('aria-busy');
    replaceChildren(parts.main, content);
    setDrawer(false);
    window.scrollTo(0, 0);
    parts.main.focus({ preventScroll: true });
  },

  busy() { parts?.main.setAttribute('aria-busy', 'true'); },
  reset() { parts = null; setDrawer(false); },
};
