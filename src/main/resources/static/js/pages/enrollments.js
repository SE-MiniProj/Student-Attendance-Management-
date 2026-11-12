// Admin: who is enrolled in which section (single, bulk CSV upload, bulk remove).
import { api } from '../api.js';
import { h, replaceChildren } from '../dom.js';
import { pageHead, dataTable, rowActions, badge, emptyBlock, run } from '../ui/components.js';
import { formDialog } from '../ui/form.js';
import { confirmDialog, modal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { icon } from '../ui/icons.js';

const sectionLabel = (s) => `${s.courseCode} · Section ${s.sectionName} · ${s.semesterName} · ${s.teacherName}`;

async function render({ query }) {
  const sections = await api.get('/api/admin/sections');
  if (!sections.length) {
    return h('section', { class: 'page' }, pageHead('Enrollments', 'Manage class lists for each section.'),
      h('div', { class: 'card' }, emptyBlock({ title: 'No sections yet', message: 'Create a section first, then enroll students in it.',
        action: h('a', { class: 'btn btn-primary', href: '#/admin/sections' }, 'Go to sections') })));
  }

  let current = sections.find((s) => String(s.id) === query.get('section')) || sections[0];
  let roster = [];
  const selected = new Set();                      // student (user) ids ticked for bulk removal
  const body = h('div', { class: 'stack' });

  async function load() {
    roster = await api.get(`/api/admin/enrollments/section/${current.id}`);
    selected.clear();
    draw();
  }

  async function reload() {
    try { await load(); } catch (err) { toast(err.readable, 'error'); }
  }

  function draw() {
    const allTicked = roster.length > 0 && roster.every((e) => selected.has(e.studentId));
    const toggleAll = h('input', { type: 'checkbox', checked: allTicked, 'aria-label': 'Select all students',
      onchange: (e) => { roster.forEach((r) => (e.target.checked ? selected.add(r.studentId) : selected.delete(r.studentId))); draw(); } });

    const seats = current.capacity ? `${roster.length} of ${current.capacity} seats filled` : `${roster.length} enrolled`;
    const removeSelected = h('button', { class: 'btn btn-danger', type: 'button', disabled: selected.size === 0, onclick: removeMany },
      selected.size ? `Remove ${selected.size} selected` : 'Remove selected');

    replaceChildren(body,
      h('div', { class: 'toolbar' },
        h('p', { class: 'grow muted', role: 'status' }, seats),
        removeSelected,
        h('button', { class: 'btn', type: 'button', onclick: upload }, icon('upload', 18), 'Upload CSV'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: enroll }, icon('plus', 18), 'Enroll student')),
      dataTable({
        caption: `Students enrolled in ${sectionLabel(current)}`, rows: roster,
        empty: { title: 'No students enrolled', message: 'Enroll students one at a time, or upload a CSV of roll numbers.' },
        columns: [
          { label: toggleAll, render: (e) => h('input', { type: 'checkbox', checked: selected.has(e.studentId), 'aria-label': `Select ${e.studentName}`,
            onchange: (ev) => { if (ev.target.checked) selected.add(e.studentId); else selected.delete(e.studentId); draw(); } }) },
          { label: 'Student', render: (e) => h('span', { class: 'cell-strong' }, e.studentName) },
          { label: 'Roll number', render: (e) => e.rollNumber, className: 'num' },
          { label: 'Status', render: (e) => badge(e.status === 'ACTIVE' ? 'Enrolled' : e.status, e.status === 'ACTIVE' ? 'present' : 'neutral') },
          { label: '', align: 'end', render: (e) => rowActions([{ label: `Remove ${e.studentName}`, icon: 'trash', danger: true, onclick: () => removeOne(e) }]) },
        ],
      }),
    );
  }

  async function enroll() {
    const students = (await api.get('/api/admin/users', { role: 'STUDENT' }))
      .filter((u) => u.active && !roster.some((e) => e.studentId === u.id));
    if (!students.length) { toast('Every active student is already in this section.', 'error'); return; }
    const saved = await formDialog({
      title: 'Enroll student', intro: sectionLabel(current), submitLabel: 'Enroll',
      fields: [{ name: 'studentId', label: 'Student', type: 'select', required: true, value: '',
        options: [{ value: '', label: 'Choose a student' }, ...students.map((u) => ({ value: u.id, label: `${u.fullName} (${u.rollNumber})` }))] }],
      onSubmit: (v) => api.post('/api/admin/enrollments', { studentId: Number(v.studentId), sectionId: current.id }),
    });
    if (saved) { toast(`${saved.studentName} enrolled`); reload(); }
  }

  async function removeOne(enrollment) {
    const ok = await confirmDialog({ title: `Remove ${enrollment.studentName}?`,
      message: `They will no longer be on the class list for ${current.courseCode} section ${current.sectionName}. Attendance already recorded is kept.`,
      confirmLabel: 'Remove student', danger: true });
    if (!ok) return;
    const { ok: done } = await run(null, () => api.delete(`/api/admin/enrollments/${enrollment.id}`), `${enrollment.studentName} removed`);
    if (done) reload();
  }

  async function removeMany() {
    const ok = await confirmDialog({ title: `Remove ${selected.size} students?`,
      message: `They will be taken off the class list for ${current.courseCode} section ${current.sectionName}. Attendance already recorded is kept.`,
      confirmLabel: `Remove ${selected.size}`, danger: true });
    if (!ok) return;
    const { ok: done } = await run(null, () => api.delete('/api/admin/enrollments/bulk', { studentIds: [...selected], sectionId: current.id }), 'Students removed');
    if (done) reload();
  }

  function upload() {
    const file = h('input', { class: 'input', type: 'file', id: 'csv-file', accept: '.csv,text/csv,text/plain' });
    const message = h('div', { role: 'alert' });
    const result = h('div');
    const send = h('button', { class: 'btn btn-primary', type: 'submit' }, 'Upload and enroll');
    const form = h('form', { class: 'form', novalidate: true,
      onsubmit: async (ev) => {
        ev.preventDefault();
        message.replaceChildren();
        if (!file.files[0]) { message.append(h('p', { class: 'form-error' }, 'Choose a CSV file first.')); return; }
        const data = new FormData();
        data.append('file', file.files[0]);
        data.append('sectionId', current.id);
        const { ok, value } = await run(send, () => api.upload('/api/admin/enrollments/bulk', data));
        if (!ok) return;
        showResult(value);
        reload();
      } },
      h('p', { class: 'muted' }, `Adding to ${sectionLabel(current)}.`),
      h('div', { class: 'field' }, h('label', { for: 'csv-file' }, 'CSV file'), file,
        h('p', { class: 'field-hint' }, 'One roll number per line, e.g. CS2024001. A header row is optional. Add a second column with a section id to override the section for that line.')),
      message, result,
      h('div', { class: 'form-actions' }, h('button', { class: 'btn', type: 'button', onclick: () => m.close() }, 'Close'), send));

    function showResult(r) {
      replaceChildren(result, h('div', { class: 'card', style: 'padding: var(--s-4)' },
        h('p', null, h('strong', null, `${r.enrolled} enrolled`), `, ${r.skipped} already enrolled${r.errors.length ? `, ${r.errors.length} could not be processed` : ''}.`),
        r.errors.length > 0 && h('ul', { class: 'error-list' }, r.errors.map((e) => h('li', null, e)))));
    }
    const m = modal({ title: 'Upload class list', content: form, wide: true });
  }

  const picker = h('div', { class: 'field grow' },
    h('label', { for: 'section-picker' }, 'Section'),
    h('select', { class: 'select', id: 'section-picker',
      onchange: async (e) => {
        current = sections.find((s) => String(s.id) === e.target.value);
        window.history.replaceState(null, '', `#/admin/enrollments?section=${current.id}`);
        await reload();
      } },
      sections.map((s) => h('option', { value: s.id, selected: s.id === current.id }, sectionLabel(s)))));

  await load();
  return h('section', { class: 'page' },
    pageHead('Enrollments', 'Manage the class list for each section.'),
    h('div', { class: 'toolbar' }, picker),
    body,
  );
}

export const route = {
  path: '/admin/enrollments', title: 'Enrollments', roles: ['ADMIN'],
  nav: { label: 'Enrollments', group: 'Administration', icon: 'enroll', order: 5 },
  render,
};
