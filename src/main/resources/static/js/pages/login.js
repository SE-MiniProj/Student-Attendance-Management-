import { h } from '../dom.js';
import { session } from '../session.js';
import { navigate } from '../router.js';

const MARK = (onLight = false) => {
  const bg = onLight ? '#213b8c' : '#fff';
  const fg = onLight ? '#fff' : '#213b8c';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('class', 'brand-mark');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<rect width="32" height="32" rx="7" fill="${bg}"/>`
    + `<path d="M8 9.5h16M8 16h16M8 22.5h9" stroke="${fg}" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>`
    + `<path d="M17.5 21.5l3.2 3.2 6-7.4" fill="none" stroke="${fg}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return svg;
};

// Seeded accounts (see DataInitializer). Shown only when running on localhost.
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@college.edu', password: 'Admin@123' },
  { label: 'Teacher', email: 'teacher@college.edu', password: 'Teacher@123' },
  { label: 'Student', email: 'student@college.edu', password: 'Student@123' },
];
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

function samplePage() {
  const rows = [['Asha Rao', 'P', 'm-p'], ['Rohit Menon', 'A', 'm-a'], ['Meera Iyer', 'P', 'm-p'], ['Karan Shah', 'L', 'm-l'], ['Divya Nair', 'E', 'm-e']];
  return h('div', { class: 'sample-page', 'aria-hidden': 'true' },
    h('div', { class: 'sample-title' }, 'Class register'),
    rows.map(([name, letter, cls]) => h('div', { class: 'sample-row' }, h('span', null, name), h('span', { class: `m ${cls}` }, letter))),
  );
}

function render() {
  const email = h('input', { class: 'input', id: 'email', type: 'email', name: 'email', autocomplete: 'username', required: true, autofocus: true });
  const password = h('input', { class: 'input', id: 'password', type: 'password', name: 'password', autocomplete: 'current-password', required: true });
  const toggle = h('button', { class: 'btn btn-quiet btn-sm', type: 'button', 'aria-pressed': 'false',
    onclick: () => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-pressed', String(show));
    } }, 'Show');
  const message = h('div', { role: 'alert' });
  const submit = h('button', { class: 'btn btn-primary', type: 'submit' }, 'Sign in');

  const flash = session.takeFlash();
  if (flash) message.append(h('p', { class: 'form-info' }, flash));

  const form = h('form', { class: 'login-form', novalidate: true,
    onsubmit: async (event) => {
      event.preventDefault();
      message.replaceChildren();
      if (!email.value.trim() || !password.value) {
        message.append(h('p', { class: 'form-error' }, 'Enter your email and password.'));
        (email.value.trim() ? password : email).focus();
        return;
      }
      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      try {
        await session.signIn(email.value.trim(), password.value);
        navigate('/');
      } catch (err) {
        const text = err.status === 403 ? 'This account is deactivated. Ask an administrator to reactivate it.' : err.readable;
        message.replaceChildren(h('p', { class: 'form-error' }, text));
        password.select();
      } finally {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
      }
    } },
    h('div', { class: 'field' }, h('label', { for: 'email' }, 'Email'), email),
    h('div', { class: 'field' }, h('label', { for: 'password' }, 'Password'), h('div', { class: 'input-group' }, password, toggle)),
    message,
    submit,
  );

  const demo = isLocal && h('div', { class: 'demo-box' },
    h('p', { class: 'small muted' }, 'Local demo accounts – fills the form for you.'),
    h('div', { class: 'row' }, DEMO_ACCOUNTS.map((a) => h('button', { class: 'btn btn-sm', type: 'button',
      onclick: () => { email.value = a.email; password.value = a.password; password.focus(); } }, a.label))),
  );

  return h('div', { class: 'login' },
    h('aside', { class: 'login-aside' },
      h('span', { class: 'brand' }, MARK(), 'SAMS'),
      h('div', null,
        h('h1', null, 'Every class, on the record.'),
        h('p', { class: 'lede' }, 'Take attendance, follow percentages and manage class lists in one place.'),
      ),
      samplePage(),
    ),
    h('main', { class: 'login-main', id: 'main' },
      h('div', { class: 'login-card' },
        h('span', { class: 'brand' }, MARK(true), 'SAMS'),
        h('div', null, h('h2', null, 'Sign in'), h('p', { class: 'muted' }, 'Use the email and password your college gave you.')),
        form,
        demo,
      ),
    ),
  );
}

export const route = { path: '/login', title: 'Sign in', bare: true, render };
