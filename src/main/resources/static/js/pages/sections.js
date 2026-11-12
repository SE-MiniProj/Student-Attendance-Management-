// Admin: sections = one course taught by one teacher in one semester.
import { api } from '../api.js';
import { h, replaceChildren } from '../dom.js';
import { pageHead, dataTable, rowActions, run } from '../ui/components.js';
import { formDialog } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

const choose = (label, items, toOption) => [{ value: '', label }, ...items.map(toOption)];

async function render() {
  const [courses, semesters, teachers] = await Promise.all([
    api.get('/api/courses'),
    api.get('/api/admin/semesters'),
    api.get('/api/admin/users', { role: 'TEACHER' }),
  ]);
  const activeTeachers = teachers.filter((t) => t.active);
  const filters = { semesterId: '', courseId: '' };
  let sections = await api.get('/api/admin/sections');
  const list = h('div');

  const fields = (s = {}) => [
    { name: 'courseId', label: 'Course', type: 'select', required: true, value: s.courseId ?? '',
      options: choose('Choose a course', courses, (c) => ({ value: c.id, label: `${c.code} – ${c.name}` })) },
    { name: 'semesterId', label: 'Semester', type: 'select', required: true, value: s.semesterId ?? '',
      options: choose('Choose a semester', semesters, (m) => ({ value: m.id, label: m.name })) },
    { name: 'sectionName', label: 'Section name', required: true, value: s.sectionName, placeholder: 'A', maxlength: 20 },
    { name: 'teacherId', label: 'Teacher', type: 'select', required: true, value: s.teacherId ?? '',
      options: choose('Choose a teacher', activeTeachers, (t) => ({ value: t.id, label: t.fullName })) },
    { name: 'room', label: 'Room', value: s.room ?? '', placeholder: 'Room 101' },
    { name: 'capacity', label: 'Capacity', type: 'number', value: s.capacity ?? '', min: 1, step: 1, hint: 'Optional.' },
  ];

  const payload = (v) => ({ ...v, courseId: Number(v.courseId), semesterId: Number(v.semesterId), teacherId: Number(v.teacherId) });

  function draw() {
    replaceChildren(list, dataTable({
      caption: 'Sections', rows: sections,
      empty: (filters.semesterId || filters.courseId)
        ? { title: 'No sections match these filters', message: 'Choose another semester or course.' }
        : { title: 'No sections yet', message: 'A section links a course, a semester and a teacher.',
            action: h('button', { class: 'btn btn-primary', type: 'button', onclick: add }, 'Add section') },
      columns: [
        { label: 'Course', render: (s) => h('span', { class: 'cell-strong' }, s.courseCode, h('span', { class: 'cell-sub' }, s.courseName)) },
        { label: 'Section', render: (s) => s.sectionName },
        { label: 'Semester', render: (s) => s.semesterName },
        { label: 'Teacher', render: (s) => s.teacherName },
        { label: 'Room', render: (s) => s.room || h('span', { class: 'muted' }, '–') },
        { label: 'Seats', render: (s) => s.capacity ?? h('span', { class: 'muted' }, '–'), className: 'num' },
        { label: '', align: 'end', render: (s) => h('div', { class: 'row-actions' },
          h('button', { class: 'btn btn-sm', type: 'button', onclick: () => reassign(s) }, 'Change teacher'),
          rowActions([
            { label: `Edit ${s.courseCode} section ${s.sectionName}`, icon: 'edit', onclick: () => edit(s) },
            { label: `Delete ${s.courseCode} section ${s.sectionName}`, icon: 'trash', danger: true, onclick: () => remove(s) },
          ])) },
      ],
    }));
  }

  async function reload() {
    try {
      sections = await api.get('/api/admin/sections', { semesterId: filters.semesterId, courseId: filters.courseId });
      draw();
    } catch (err) { toast(err.readable, 'error'); }
  }

  function prerequisitesMissing() {
    const missing = [!courses.length && 'a course', !semesters.length && 'a semester', !activeTeachers.length && 'an active teacher'].filter(Boolean);
    if (!missing.length) return false;
    toast(`Add ${missing.join(' and ')} before creating a section.`, 'error');
    return true;
  }

  async function add() {
    if (prerequisitesMissing()) return;
    const saved = await formDialog({ title: 'Add section', wide: true, submitLabel: 'Add section', fields: fields(),
      onSubmit: (v) => api.post('/api/admin/sections', payload(v)) });
    if (saved) { toast(`${saved.courseCode} section ${saved.sectionName} added`); reload(); }
  }

  async function edit(section) {
    const saved = await formDialog({ title: `Edit ${section.courseCode} section ${section.sectionName}`, wide: true, submitLabel: 'Save changes', fields: fields(section),
      onSubmit: (v) => api.put(`/api/admin/sections/${section.id}`, payload(v)) });
    if (saved) { toast('Section saved'); reload(); }
  }

  async function reassign(section) {
    const saved = await formDialog({
      title: 'Change teacher', intro: `${section.courseCode} section ${section.sectionName}, ${section.semesterName}. Currently ${section.teacherName}.`,
      submitLabel: 'Change teacher',
      fields: [{ name: 'teacherId', label: 'New teacher', type: 'select', required: true, value: section.teacherId,
        options: choose('Choose a teacher', activeTeachers, (t) => ({ value: t.id, label: t.fullName })) }],
      onSubmit: (v) => api.patch(`/api/admin/sections/${section.id}/assign-faculty`, { teacherId: Number(v.teacherId) }),
    });
    if (saved) { toast(`Now taught by ${saved.teacherName}`); reload(); }
  }

  async function remove(section) {
    const ok = await confirmDialog({
      title: `Delete section ${section.sectionName}?`,
      message: `${section.courseCode} section ${section.sectionName} (${section.semesterName}) will be removed. This cannot be undone.`,
      confirmLabel: 'Delete section', danger: true });
    if (!ok) return;
    try { await api.delete(`/api/admin/sections/${section.id}`); toast('Section deleted'); reload(); }
    catch (err) {
      toast(err.status >= 500 ? 'This section still has enrolled students, so it cannot be deleted. Remove the enrollments first.' : err.readable, 'error');
    }
  }

  const filter = (id, label, name, firstLabel, items, toOption) => h('div', { class: 'field' },
    h('label', { for: id }, label),
    h('select', { class: 'select', id, onchange: (e) => { filters[name] = e.target.value; reload(); } },
      h('option', { value: '' }, firstLabel), items.map((i) => { const o = toOption(i); return h('option', { value: o.value }, o.label); })));

  draw();
  return h('section', { class: 'page' },
    pageHead('Sections', 'Which teacher takes which course in which semester.', h('button', { class: 'btn btn-primary', type: 'button', onclick: add }, 'Add section')),
    h('div', { class: 'toolbar' },
      filter('filter-semester', 'Semester', 'semesterId', 'All semesters', semesters, (m) => ({ value: m.id, label: m.name })),
      filter('filter-course', 'Course', 'courseId', 'All courses', courses, (c) => ({ value: c.id, label: c.code }))),
    list,
  );
}

export const route = {
  path: '/admin/sections', title: 'Sections', roles: ['ADMIN'],
  nav: { label: 'Sections', group: 'Administration', icon: 'layers', order: 4 },
  render,
};
