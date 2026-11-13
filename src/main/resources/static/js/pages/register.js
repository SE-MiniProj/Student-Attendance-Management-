// Teacher / admin: take attendance for one section on one date.
//
// API facts this page works around:
//  - Attendance is keyed by the legacy Student id, not the User id, so each
//    enrolled student is matched to a Student record by roll number.
//  - There is no update endpoint and a repeat POST answers 409, so marks that are
//    already recorded are shown locked.
import { api } from '../api.js';
import { h, replaceChildren, todayISO, fmtDate, fmtWeekday } from '../dom.js';
import { session } from '../session.js';
import { pageHead, emptyBlock, run } from '../ui/components.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { STATUSES, statusInfo, statusBadge } from '../ui/status.js';

const sectionLabel = (s) => `${s.courseCode} · Section ${s.sectionName} · ${s.semesterName}`;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Run `task` over `items` with at most `limit` in flight. */
async function pool(items, limit, task) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await task(queue.shift());
  }));
}

async function render({ query, user }) {
  const isAdmin = user.role === 'ADMIN';
  const [allSections, students] = await Promise.all([api.get('/api/admin/sections'), api.get('/api/students')]);
  const sections = isAdmin ? allSections : allSections.filter((s) => s.teacherId === user.userId);

  if (!sections.length) {
    return h('section', { class: 'page' }, pageHead('Take attendance'),
      h('div', { class: 'card' }, emptyBlock({ title: 'No sections assigned to you',
        message: 'Once an administrator assigns you to a section, it will appear here.' })));
  }

  const studentIdByRoll = new Map(students.map((s) => [s.rollNumber, s.id]));
  const today = todayISO();

  const state = {
    section: sections.find((s) => String(s.id) === query.get('section')) || sections[0],
    date: ISO.test(query.get('date') || '') ? query.get('date') : today,
    rows: [],                 // [{ enrollment, studentId | null }]
    recorded: new Map(),      // studentId -> saved record
    pending: new Map(),       // studentId -> status chosen but not saved yet
    errors: new Map(),        // studentId -> message from the last failed save
    saving: false,
  };
  let loadToken = 0;
  const body = h('div', { class: 'stack' });

  async function load() {
    const token = ++loadToken;
    const [roster, records] = await Promise.all([
      api.get(`/api/admin/enrollments/section/${state.section.id}`),
      api.get(`/api/attendance/course/${state.section.courseId}`, { date: state.date }),
    ]);
    if (token !== loadToken) return;
    state.rows = roster
      .map((enrollment) => ({ enrollment, studentId: studentIdByRoll.get(enrollment.rollNumber) ?? null }))
      .sort((a, b) => a.enrollment.rollNumber.localeCompare(b.enrollment.rollNumber, undefined, { numeric: true }));
    state.recorded = new Map(records.map((r) => [r.studentId, r]));
    state.pending.clear();
    state.errors.clear();
    draw();
  }

  const statusOf = (row) => state.recorded.get(row.studentId)?.status ?? state.pending.get(row.studentId) ?? null;

  function setMark(row, status) {
    state.pending.set(row.studentId, status);
    state.errors.delete(row.studentId);
    drawSummary();
  }

  // --- drawing -------------------------------------------------------------
  const summaryEl = h('div', { class: 'register-summary', role: 'status' });
  const saveBtn = h('button', { class: 'btn btn-primary', type: 'button', onclick: save });
  const markAllBtn = h('button', { class: 'btn', type: 'button', onclick: markAllPresent }, 'Mark all present');
  const clearBtn = h('button', { class: 'btn btn-quiet', type: 'button', onclick: clearPending }, 'Clear unsaved');

  function drawSummary() {
    const counts = Object.fromEntries(STATUSES.map((s) => [s.value, 0]));
    let unmarked = 0;
    for (const row of state.rows) {
      if (row.studentId === null) continue;
      const status = statusOf(row);
      if (status) counts[status] += 1; else unmarked += 1;
    }
    replaceChildren(summaryEl,
      STATUSES.map((s) => h('span', { class: `tally tally-${s.tone}` }, h('strong', { class: 'num' }, counts[s.value]), ` ${s.label}`)),
      h('span', { class: 'tally' }, h('strong', { class: 'num' }, unmarked), ' not marked'));

    const n = state.pending.size;
    saveBtn.textContent = n ? `Save ${n} ${n === 1 ? 'mark' : 'marks'}` : 'Save attendance';
    saveBtn.disabled = n === 0 || state.saving;
    markAllBtn.disabled = state.saving || !state.rows.some((r) => r.studentId !== null && !statusOf(r));
    clearBtn.hidden = n === 0;
  }

  function segmented(row) {
    const name = `mark-${row.studentId}`;
    const current = statusOf(row);
    return h('fieldset', { class: 'seg' },
      h('legend', { class: 'sr-only' }, `Attendance for ${row.enrollment.studentName}`),
      STATUSES.map((s) => h('label', { class: `seg-opt seg-${s.tone}` },
        h('input', { type: 'radio', name, value: s.value, checked: current === s.value, onchange: () => setMark(row, s.value) }),
        h('span', { class: 'seg-text', 'aria-hidden': 'true' }, h('span', { class: 'short' }, s.short), h('span', { class: 'long' }, s.label)),
        h('span', { class: 'sr-only' }, s.label))));
  }

  function rowEl(row, index) {
    const { enrollment: e, studentId } = row;
    const saved = studentId !== null ? state.recorded.get(studentId) : null;
    const error = studentId !== null ? state.errors.get(studentId) : null;
    let control;
    if (studentId === null) control = h('span', { class: 'small muted' }, 'No student record, cannot mark');
    else if (saved) control = h('span', { class: 'locked' }, statusBadge(saved.status), h('span', { class: 'small muted' }, 'Recorded'));
    else control = segmented(row);
    return h('li', { class: 'register-row' },
      h('span', { class: 'serial num' }, index + 1),
      h('span', { class: 'who' }, h('strong', null, e.studentName), h('span', { class: 'small muted num' }, e.rollNumber)),
      control,
      error && h('p', { class: 'field-error row-error' }, error));
  }

  function draw() {
    const { rows } = state;
    const recordedCount = rows.filter((r) => r.studentId !== null && state.recorded.has(r.studentId)).length;
    replaceChildren(body,
      h('div', { class: 'toolbar register-tools' },
        h('div', { class: 'grow' }, summaryEl),
        clearBtn, markAllBtn),
      recordedCount > 0 && h('p', { class: 'form-info' },
        recordedCount === rows.length
          ? `Attendance for ${fmtDate(state.date)} has already been recorded for everyone. Recorded marks cannot be changed here.`
          : `${recordedCount} of ${rows.length} students already have a mark for this date. Recorded marks cannot be changed here.`),
      rows.length
        ? h('div', { class: 'card register' },
            h('div', { class: 'register-head' }, h('strong', null, sectionLabel(state.section)),
              h('span', { class: 'muted' }, `${fmtWeekday(state.date)}, ${fmtDate(state.date)}`)),
            h('ol', { class: 'register-list' }, rows.map(rowEl)))
        : h('div', { class: 'card' }, emptyBlock({ title: 'No students enrolled', message: 'This section has no class list yet. An administrator can add students under Enrollments.' })),
      h('div', { class: 'register-foot' }, saveBtn),
    );
    drawSummary();
  }

  // --- actions -------------------------------------------------------------
  function markAllPresent() {
    for (const row of state.rows) {
      if (row.studentId !== null && !statusOf(row)) state.pending.set(row.studentId, 'PRESENT');
    }
    draw();
  }

  function clearPending() { state.pending.clear(); state.errors.clear(); draw(); }

  async function save() {
    const entries = [...state.pending];
    const failures = new Map();
    state.saving = true;
    drawSummary();
    saveBtn.setAttribute('aria-busy', 'true');
    let saved = 0;

    await pool(entries, 5, async ([studentId, status]) => {
      try {
        await api.post('/api/attendance', { studentId, courseId: state.section.courseId, date: state.date, status });
        saved += 1;
      } catch (err) {
        failures.set(studentId, err.status === 409 ? 'Someone has already recorded this student for this date.' : err.readable);
      }
    });

    state.saving = false;
    saveBtn.removeAttribute('aria-busy');
    try {
      const records = await api.get(`/api/attendance/course/${state.section.courseId}`, { date: state.date });
      state.recorded = new Map(records.map((r) => [r.studentId, r]));
    } catch (err) { toast(err.readable, 'error'); }

    for (const [id] of entries) {
      if (!failures.has(id) || state.recorded.has(id)) state.pending.delete(id);   // saved, or already recorded elsewhere
    }
    state.errors = failures;
    draw();

    if (!failures.size) toast(`Attendance saved for ${saved} ${saved === 1 ? 'student' : 'students'}`);
    else toast(`${saved} saved, ${failures.size} could not be saved. See the highlighted rows.`, 'error');
  }

  async function confirmDiscard() {
    if (!state.pending.size) return true;
    return confirmDialog({ title: 'Discard unsaved marks?',
      message: `${state.pending.size} ${state.pending.size === 1 ? 'mark has' : 'marks have'} not been saved. Changing the section or date will discard them.`,
      confirmLabel: 'Discard marks', danger: true });
  }

  function syncUrl() {
    window.history.replaceState(null, '', `#/attendance/mark?section=${state.section.id}&date=${state.date}`);
  }

  const sectionSelect = h('select', { class: 'select', id: 'reg-section',
    onchange: async (e) => {
      if (!(await confirmDiscard())) { e.target.value = state.section.id; return; }
      state.section = sections.find((s) => String(s.id) === e.target.value);
      syncUrl();
      await run(null, load);
    } }, sections.map((s) => h('option', { value: s.id, selected: s.id === state.section.id }, sectionLabel(s))));

  const dateInput = h('input', { class: 'input', id: 'reg-date', type: 'date', value: state.date, max: today,
    onchange: async (e) => {
      const next = e.target.value;
      if (!ISO.test(next)) { e.target.value = state.date; return; }
      if (!(await confirmDiscard())) { e.target.value = state.date; return; }
      state.date = next;
      syncUrl();
      await run(null, load);
    } });

  await load();
  return h('section', { class: 'page' },
    pageHead('Take attendance', 'Choose a section and date, mark each student, then save.'),
    h('div', { class: 'toolbar' },
      h('div', { class: 'field grow' }, h('label', { for: 'reg-section' }, 'Section'), sectionSelect),
      h('div', { class: 'field' }, h('label', { for: 'reg-date' }, 'Date'), dateInput)),
    body,
  );
}

export const route = {
  path: '/attendance/mark', title: 'Take attendance', roles: ['ADMIN', 'TEACHER'],
  nav: { label: 'Take attendance', group: 'Attendance', icon: 'register', order: 1 },
  render,
};
