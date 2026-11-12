// Teacher / admin: attendance percentage for every student in a section.
import { api } from '../api.js';
import { h, replaceChildren, fmtDate, fmtWeekday, fmtPercent } from '../dom.js';
import { pageHead, dataTable, rowActions, badge, emptyBlock, loadingBlock, run } from '../ui/components.js';
import { modal } from '../ui/modal.js';
import { statusBadge, REQUIRED_PERCENT } from '../ui/status.js';
import { icon } from '../ui/icons.js';
import { toast } from '../ui/toast.js';

const sectionLabel = (s) => `${s.courseCode} · Section ${s.sectionName} · ${s.semesterName}`;

async function pool(items, limit, task) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await task(queue.shift());
  }));
}

/** Quote a CSV cell; a leading = + - @ would be run as a formula by Excel, so neutralise it. */
function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function render({ query, user }) {
  const [allSections, students] = await Promise.all([api.get('/api/admin/sections'), api.get('/api/students')]);
  const sections = user.role === 'ADMIN' ? allSections : allSections.filter((s) => s.teacherId === user.userId);
  if (!sections.length) {
    return h('section', { class: 'page' }, pageHead('Class report'),
      h('div', { class: 'card' }, emptyBlock({ title: 'No sections assigned to you', message: 'Sections assigned to you will appear here.' })));
  }
  const studentIdByRoll = new Map(students.map((s) => [s.rollNumber, s.id]));

  let section = sections.find((s) => String(s.id) === query.get('section')) || sections[0];
  let rows = [];              // [{ name, roll, studentId, attended, total, percentage }]
  let onlyBelow = false;
  let token = 0;
  const body = h('div', { class: 'stack' });

  async function load() {
    const mine = ++token;
    replaceChildren(body, h('div', { class: 'card' }, loadingBlock(5)));
    const roster = await api.get(`/api/admin/enrollments/section/${section.id}`);
    const next = roster.map((e) => ({ name: e.studentName, roll: e.rollNumber, studentId: studentIdByRoll.get(e.rollNumber) ?? null, attended: 0, total: 0, percentage: null }));
    await pool(next.filter((r) => r.studentId !== null), 6, async (r) => {
      const s = await api.get(`/api/attendance/student/${r.studentId}/course/${section.courseId}/summary`);
      Object.assign(r, { attended: s.attended, total: s.totalClasses, percentage: s.percentage });
    });
    if (mine !== token) return;
    rows = next.sort((a, b) => (a.percentage ?? 101) - (b.percentage ?? 101) || a.roll.localeCompare(b.roll, undefined, { numeric: true }));
    draw();
  }

  const reload = () => run(null, load);

  function draw() {
    const measured = rows.filter((r) => r.percentage !== null && r.total > 0);
    const below = measured.filter((r) => r.percentage < REQUIRED_PERCENT);
    const average = measured.length ? measured.reduce((sum, r) => sum + r.percentage, 0) / measured.length : null;
    const shown = onlyBelow ? below : rows;

    replaceChildren(body,
      h('div', { class: 'stats' },
        stat('Students', rows.length),
        stat('Class average', average === null ? '–' : fmtPercent(Math.round(average * 10) / 10)),
        stat(`Below ${REQUIRED_PERCENT}%`, below.length, below.length ? 'absent' : null)),
      h('div', { class: 'toolbar' },
        h('label', { class: 'check grow' }, h('input', { type: 'checkbox', checked: onlyBelow, onchange: (e) => { onlyBelow = e.target.checked; draw(); } }), ` Show only students below ${REQUIRED_PERCENT}%`),
        h('button', { class: 'btn', type: 'button', disabled: rows.length === 0, onclick: exportCsv }, icon('download', 18), 'Download CSV')),
      dataTable({
        caption: `Attendance for ${sectionLabel(section)}`, rows: shown,
        empty: onlyBelow ? { title: 'Nobody is below the line', message: `Every student with recorded classes is at ${REQUIRED_PERCENT}% or more.` }
          : { title: 'No students enrolled', message: 'This section has no class list yet.' },
        columns: [
          { label: 'Student', render: (r) => h('span', { class: 'cell-strong' }, r.name, h('span', { class: 'cell-sub num' }, r.roll)) },
          { label: 'Attended', render: (r) => (r.studentId === null ? h('span', { class: 'muted' }, 'No student record') : r.total ? `${r.attended} of ${r.total}` : h('span', { class: 'muted' }, 'No classes yet')), className: 'num' },
          { label: 'Percentage', render: (r) => (r.total ? h('span', { class: 'pct-cell' }, h('strong', { class: 'num' }, fmtPercent(r.percentage)), miniGauge(r.percentage)) : '–') },
          { label: 'Status', render: (r) => (!r.total ? '' : r.percentage < REQUIRED_PERCENT ? badge('At risk', 'absent') : badge('On track', 'present')) },
          { label: '', align: 'end', render: (r) => r.studentId !== null && rowActions([{ label: `View ${r.name}'s history`, icon: 'report', onclick: () => showHistory(r) }]) },
        ],
      }));
  }

  const stat = (label, value, tone) => h('div', { class: 'stat card' }, h('span', { class: 'small muted' }, label), h('strong', { class: `stat-value num${tone ? ` stat-${tone}` : ''}` }, value));
  const miniGauge = (pct) => h('span', { class: `gauge gauge-mini ${pct < REQUIRED_PERCENT ? (pct >= REQUIRED_PERCENT - 10 ? 'gauge-late' : 'gauge-absent') : ''}`, 'aria-hidden': 'true' },
    h('span', { class: 'gauge-fill', style: `display:block;width:${Math.min(100, pct)}%` }));

  async function showHistory(row) {
    const holder = h('div', null, loadingBlock(4));
    modal({ title: row.name, wide: true, content: holder });
    try {
      const records = (await api.get(`/api/attendance/student/${row.studentId}/course/${section.courseId}`)).sort((a, b) => b.date.localeCompare(a.date));
      replaceChildren(holder,
        h('p', { class: 'muted' }, `${sectionLabel(section)} · ${row.roll} · ${row.attended} of ${row.total} classes attended`),
        records.length ? h('div', { class: 'history-scroll' }, dataTable({ caption: 'Attendance history', rows: records, columns: [
          { label: 'Date', render: (r) => fmtDate(r.date), className: 'num' },
          { label: 'Day', render: (r) => fmtWeekday(r.date) },
          { label: 'Mark', render: (r) => statusBadge(r.status) },
        ] })) : emptyBlock({ title: 'No classes recorded yet' }));
    } catch (err) { replaceChildren(holder, h('p', { class: 'form-error' }, err.readable)); }
  }

  function exportCsv() {
    const lines = [['Roll number', 'Name', 'Attended', 'Total classes', 'Percentage', 'Status']];
    for (const r of rows) {
      lines.push([r.roll, r.name, r.attended, r.total, r.total ? r.percentage : '', !r.total ? '' : r.percentage < REQUIRED_PERCENT ? 'At risk' : 'On track']);
    }
    const name = `attendance-${section.courseCode}-${section.sectionName}-${section.semesterName}.csv`.replace(/[^\w.-]+/g, '_');
    download(name, lines.map((l) => l.map(csvCell).join(',')).join('\r\n'));
    toast('CSV downloaded');
  }

  const select = h('select', { class: 'select', id: 'rep-section',
    onchange: (e) => {
      section = sections.find((s) => String(s.id) === e.target.value);
      window.history.replaceState(null, '', `#/reports?section=${section.id}`);
      reload();
    } }, sections.map((s) => h('option', { value: s.id, selected: s.id === section.id }, sectionLabel(s))));

  await load();
  return h('section', { class: 'page' },
    pageHead('Class report', `Who is on track and who needs a conversation. The line is ${REQUIRED_PERCENT}%.`),
    h('div', { class: 'toolbar' }, h('div', { class: 'field grow' }, h('label', { for: 'rep-section' }, 'Section'), select)),
    body);
}

export const route = {
  path: '/reports', title: 'Class report', roles: ['ADMIN', 'TEACHER'],
  nav: { label: 'Class report', group: 'Attendance', icon: 'report', order: 2 },
  render,
};
