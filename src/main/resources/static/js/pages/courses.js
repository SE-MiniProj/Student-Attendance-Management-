// Admin: course catalogue (create, edit, delete).
import { api } from '../api.js';
import { h, replaceChildren } from '../dom.js';
import { pageHead, dataTable, rowActions, searchBox } from '../ui/components.js';
import { formDialog } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

const courseFields = (course = {}) => [
  { name: 'code', label: 'Course code', value: course.code, required: true, placeholder: 'CS301', maxlength: 20 },
  { name: 'credits', label: 'Credits', type: 'number', value: course.credits ?? 4, required: true, min: 1, max: 10, step: 1 },
  { name: 'name', label: 'Course name', value: course.name, required: true, wide: true, placeholder: 'Operating Systems' },
  { name: 'description', label: 'Description', type: 'textarea', value: course.description ?? '', wide: true, hint: 'Optional. Shown to teachers and students.' },
];

async function render() {
  let courses = await api.get('/api/courses');
  let query = '';
  const list = h('div');

  const matches = (c) => !query || `${c.code} ${c.name} ${c.description || ''}`.toLowerCase().includes(query);

  function draw() {
    replaceChildren(list, dataTable({
      caption: 'Courses',
      rows: courses.filter(matches),
      empty: courses.length
        ? { title: 'No matching courses', message: 'Try a different search.' }
        : { title: 'No courses yet', message: 'Add a course, then create sections for it in a semester.',
            action: h('button', { class: 'btn btn-primary', type: 'button', onclick: add }, 'Add course') },
      columns: [
        { label: 'Code', render: (c) => h('span', { class: 'cell-strong num' }, c.code) },
        { label: 'Course', render: (c) => h('span', null, c.name, c.description && h('span', { class: 'cell-sub' }, c.description)) },
        { label: 'Credits', render: (c) => c.credits, className: 'num' },
        { label: '', align: 'end', render: (c) => rowActions([
          { label: `Edit ${c.code}`, icon: 'edit', onclick: () => edit(c) },
          { label: `Delete ${c.code}`, icon: 'trash', danger: true, onclick: () => remove(c) },
        ]) },
      ],
    }));
  }

  async function reload() {
    try { courses = await api.get('/api/courses'); draw(); }
    catch (err) { toast(err.readable, 'error'); }
  }

  async function add() {
    const saved = await formDialog({
      title: 'Add course', wide: true, submitLabel: 'Add course', fields: courseFields(),
      onSubmit: (v) => api.post('/api/courses', v),
    });
    if (saved) { toast(`${saved.code} added`); reload(); }
  }

  async function edit(course) {
    const saved = await formDialog({
      title: `Edit ${course.code}`, wide: true, submitLabel: 'Save changes', fields: courseFields(course),
      onSubmit: (v) => api.put(`/api/courses/${course.id}`, v),
    });
    if (saved) { toast(`${saved.code} saved`); reload(); }
  }

  async function remove(course) {
    const ok = await confirmDialog({
      title: `Delete ${course.code}?`,
      message: `${course.name} will be removed from the catalogue. This cannot be undone.`,
      confirmLabel: 'Delete course', danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/api/courses/${course.id}`);
      toast(`${course.code} deleted`);
      reload();
    } catch (err) {
      // The API answers 500 when the course is still referenced by sections or attendance.
      toast(err.status >= 500
        ? `${course.code} is still used by sections or attendance records, so it cannot be deleted.`
        : err.readable, 'error');
    }
  }

  draw();
  return h('section', { class: 'page' },
    pageHead('Courses', 'The catalogue every section is created from.',
      h('button', { class: 'btn btn-primary', type: 'button', onclick: add }, 'Add course')),
    h('div', { class: 'toolbar' }, searchBox({ label: 'Search courses', placeholder: 'Search by code or name', onInput: (q) => { query = q; draw(); } })),
    list,
  );
}

export const route = {
  path: '/admin/courses', title: 'Courses', roles: ['ADMIN'],
  nav: { label: 'Courses', group: 'Administration', icon: 'book', order: 2 },
  render,
};
