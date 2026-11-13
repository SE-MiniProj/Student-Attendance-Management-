// Admin: academic semesters (create, edit, activate / deactivate).
import { api, ApiError } from '../api.js';
import { h, replaceChildren, fmtDate } from '../dom.js';
import { pageHead, dataTable, rowActions, badge, run } from '../ui/components.js';
import { formDialog } from '../ui/form.js';
import { toast } from '../ui/toast.js';

const semesterFields = (s = {}) => [
  { name: 'name', label: 'Semester name', value: s.name, required: true, placeholder: '2027-EVEN', wide: true, hint: 'Must be unique, for example 2027-EVEN.' },
  { name: 'startDate', label: 'Starts', type: 'date', value: s.startDate, required: true },
  { name: 'endDate', label: 'Ends', type: 'date', value: s.endDate, required: true },
];

// The API accepts any two dates, so check the order here.
function checkDates(v) {
  if (v.endDate < v.startDate) {
    throw new ApiError(400, 'Validation failed', { endDate: 'Must be on or after the start date' });
  }
}

async function render() {
  let semesters = await api.get('/api/admin/semesters');
  const list = h('div');

  function draw() {
    const rows = [...semesters].sort((a, b) => b.startDate.localeCompare(a.startDate));
    replaceChildren(list, dataTable({
      caption: 'Semesters', rows,
      empty: { title: 'No semesters yet', message: 'Create a semester before adding sections.',
        action: h('button', { class: 'btn btn-primary', type: 'button', onclick: add }, 'Add semester') },
      columns: [
        { label: 'Semester', render: (s) => h('span', { class: 'cell-strong' }, s.name) },
        { label: 'Runs', render: (s) => `${fmtDate(s.startDate)} to ${fmtDate(s.endDate)}`, className: 'num' },
        { label: 'Status', render: (s) => (s.active ? badge('Active', 'present') : badge('Inactive')) },
        { label: '', align: 'end', render: (s) => h('div', { class: 'row-actions' },
          h('button', { class: 'btn btn-sm', type: 'button', onclick: (e) => toggle(s, e.currentTarget) }, s.active ? 'Deactivate' : 'Activate'),
          rowActions([{ label: `Edit ${s.name}`, icon: 'edit', onclick: () => edit(s) }])) },
      ],
    }));
  }

  async function reload() {
    try { semesters = await api.get('/api/admin/semesters'); draw(); }
    catch (err) { toast(err.readable, 'error'); }
  }

  async function add() {
    const saved = await formDialog({
      title: 'Add semester', submitLabel: 'Add semester', fields: semesterFields(),
      onSubmit: (v) => { checkDates(v); return api.post('/api/admin/semesters', v); },
    });
    if (saved) { toast(`${saved.name} added`); reload(); }
  }

  async function edit(semester) {
    const saved = await formDialog({
      title: `Edit ${semester.name}`, submitLabel: 'Save changes', fields: semesterFields(semester),
      onSubmit: (v) => { checkDates(v); return api.put(`/api/admin/semesters/${semester.id}`, v); },
    });
    if (saved) { toast(`${saved.name} saved`); reload(); }
  }

  async function toggle(semester, button) {
    const action = semester.active ? 'deactivate' : 'activate';
    const { ok } = await run(button, () => api.patch(`/api/admin/semesters/${semester.id}/${action}`),
      `${semester.name} ${semester.active ? 'deactivated' : 'activated'}`);
    if (ok) reload();
  }

  draw();
  return h('section', { class: 'page' },
    pageHead('Semesters', 'Each section belongs to one semester. Inactive semesters stay on record.',
      h('button', { class: 'btn btn-primary', type: 'button', onclick: add }, 'Add semester')),
    list,
  );
}

export const route = {
  path: '/admin/semesters', title: 'Semesters', roles: ['ADMIN'],
  nav: { label: 'Semesters', group: 'Administration', icon: 'calendar', order: 3 },
  render,
};
