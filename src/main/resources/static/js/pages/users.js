// Admin: user accounts (create, edit, activate / deactivate).
import { api, ApiError } from '../api.js';
import { h, replaceChildren } from '../dom.js';
import { session } from '../session.js';
import { pageHead, dataTable, rowActions, badge, searchBox, run } from '../ui/components.js';
import { formDialog } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

const ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'ADMIN', label: 'Administrator' },
];
const roleLabel = (r) => ROLES.find((x) => x.value === r)?.label ?? r;
const roleTone = { ADMIN: 'pen', TEACHER: 'late', STUDENT: 'neutral' };

const createFields = () => [
  { name: 'fullName', label: 'Full name', required: true, wide: true, autocomplete: 'off' },
  { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'off' },
  { name: 'password', label: 'Temporary password', type: 'password', required: true, autocomplete: 'new-password', hint: 'Share it with the user securely.' },
  { name: 'role', label: 'Role', type: 'select', value: 'STUDENT', required: true, options: ROLES },
  { name: 'rollNumber', label: 'Roll number', hint: 'Required for students, ignored for other roles.' },
];

const editFields = (u) => [
  { name: 'fullName', label: 'Full name', value: u.fullName, required: true, wide: true },
  { name: 'email', label: 'Email', type: 'email', value: u.email, required: true, wide: u.role !== 'STUDENT' },
  u.role === 'STUDENT' && { name: 'rollNumber', label: 'Roll number', value: u.rollNumber ?? '', required: true },
].filter(Boolean);

async function render() {
  let users = await api.get('/api/admin/users');
  let query = '';
  let roleFilter = '';
  const list = h('div');
  const me = session.user.userId;

  const matches = (u) => (!roleFilter || u.role === roleFilter)
    && (!query || `${u.fullName} ${u.email} ${u.rollNumber || ''}`.toLowerCase().includes(query));

  function draw() {
    const rows = users.filter(matches);
    replaceChildren(list, dataTable({
      caption: 'Users', rows,
      empty: users.length ? { title: 'No matching users', message: 'Try a different search or role.' } : { title: 'No users yet' },
      columns: [
        { label: 'Name', render: (u) => h('span', { class: 'cell-strong' }, u.fullName, u.id === me && h('span', { class: 'cell-sub' }, 'You'),
          u.id !== me && h('span', { class: 'cell-sub' }, u.email)) },
        { label: 'Role', render: (u) => badge(roleLabel(u.role), roleTone[u.role]) },
        { label: 'Roll number', render: (u) => u.rollNumber || h('span', { class: 'muted' }, '–'), className: 'num' },
        { label: 'Status', render: (u) => (u.active ? badge('Active', 'present') : badge('Deactivated', 'absent')) },
        { label: '', align: 'end', render: (u) => h('div', { class: 'row-actions' },
          u.id !== me && h('button', { class: 'btn btn-sm', type: 'button', onclick: (e) => toggle(u, e.currentTarget) }, u.active ? 'Deactivate' : 'Activate'),
          rowActions([{ label: `Edit ${u.fullName}`, icon: 'edit', onclick: () => edit(u) }])) },
      ],
    }));
  }

  async function reload() {
    try { users = await api.get('/api/admin/users'); draw(); }
    catch (err) { toast(err.readable, 'error'); }
  }

  async function add() {
    const saved = await formDialog({
      title: 'Add user', wide: true, submitLabel: 'Add user', fields: createFields(),
      onSubmit: (v) => {
        if (v.role === 'STUDENT' && !v.rollNumber) {
          throw new ApiError(400, 'Validation failed', { rollNumber: 'Required for students' });
        }
        return api.post('/api/admin/users', { ...v, rollNumber: v.role === 'STUDENT' ? v.rollNumber : null });
      },
    });
    if (saved) { toast(`${saved.fullName} added`); reload(); }
  }

  async function edit(user) {
    const saved = await formDialog({
      title: `Edit ${user.fullName}`, wide: true, submitLabel: 'Save changes', fields: editFields(user),
      onSubmit: (v) => api.put(`/api/admin/users/${user.id}`, v),
    });
    if (saved) { toast(`${saved.fullName} saved`); reload(); }
  }

  async function toggle(user, button) {
    if (user.active) {
      const ok = await confirmDialog({
        title: `Deactivate ${user.fullName}?`,
        message: 'They will be signed out on their next request and cannot sign in until you activate the account again. Their records are kept.',
        confirmLabel: 'Deactivate', danger: true,
      });
      if (!ok) return;
    }
    const { ok } = await run(button, () => api.patch(`/api/admin/users/${user.id}/${user.active ? 'deactivate' : 'activate'}`),
      `${user.fullName} ${user.active ? 'deactivated' : 'activated'}`);
    if (ok) reload();
  }

  const roleSelect = h('div', { class: 'field' },
    h('label', { for: 'role-filter' }, 'Role'),
    h('select', { class: 'select', id: 'role-filter', onchange: (e) => { roleFilter = e.target.value; draw(); } },
      h('option', { value: '' }, 'All roles'), ROLES.map((r) => h('option', { value: r.value }, r.label))));

  draw();
  return h('section', { class: 'page' },
    pageHead('Users', 'Student, teacher and administrator accounts.', h('button', { class: 'btn btn-primary', type: 'button', onclick: add }, 'Add user')),
    h('div', { class: 'toolbar' }, searchBox({ label: 'Search users', placeholder: 'Search by name, email or roll number', onInput: (q) => { query = q; draw(); } }), roleSelect),
    list,
  );
}

export const route = {
  path: '/admin/users', title: 'Users', roles: ['ADMIN'],
  nav: { label: 'Users', group: 'Administration', icon: 'users', order: 1 },
  render,
};
