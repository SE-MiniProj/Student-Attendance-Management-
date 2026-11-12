// Student: attendance percentage per course, with the day-by-day history.
import { api } from '../api.js';
import { h, replaceChildren, fmtDate, fmtWeekday, fmtPercent } from '../dom.js';
import { pageHead, dataTable, emptyBlock, loadingBlock } from '../ui/components.js';
import { statusBadge } from '../ui/status.js';
import { toast } from '../ui/toast.js';

export const REQUIRED_PERCENT = 75;      // the usual minimum; the API itself does not enforce one

/** Plain-language outlook for a course given attended / total classes. */
export function outlook(attended, total, required = REQUIRED_PERCENT) {
  const r = required / 100;
  if (total === 0) return { tone: 'neutral', text: 'No classes recorded yet.' };
  if (attended / total >= r) {
    const canMiss = Math.floor(attended / r - total + 1e-9);
    return { tone: 'present', text: canMiss > 0
      ? `Above ${required}%. You can miss ${canMiss} more ${canMiss === 1 ? 'class' : 'classes'} and stay there.`
      : `At ${required}%. Missing the next class would take you below it.` };
  }
  const need = Math.ceil((r * total - attended) / (1 - r) - 1e-9);
  return { tone: attended / total >= r - 0.1 ? 'late' : 'absent',
    text: `Below ${required}%. Attend the next ${need} ${need === 1 ? 'class' : 'classes'} in a row to get back to ${required}%.` };
}

function gauge(percentage, tone) {
  return h('div', { class: `gauge gauge-${tone}`, role: 'img', 'aria-label': `${fmtPercent(percentage)} attended, ${REQUIRED_PERCENT}% required` },
    h('div', { class: 'gauge-fill', style: `width:${Math.min(100, percentage)}%` }),
    h('div', { class: 'gauge-mark', style: `left:${REQUIRED_PERCENT}%`, title: `${REQUIRED_PERCENT}% required` }));
}

async function render({ query }) {
  let me;
  try {
    me = await api.get('/api/students/me');
  } catch (err) {
    if (err.status !== 404) throw err;
    return h('section', { class: 'page' }, pageHead('My attendance'),
      h('div', { class: 'card' }, emptyBlock({ title: 'No student record yet',
        message: 'Your account is not linked to a student record. Ask an administrator to check your roll number.' })));
  }

  const courses = await api.get('/api/courses');
  const summaries = (await Promise.all(courses.map((course) =>
    api.get(`/api/attendance/student/${me.id}/course/${course.id}/summary`).then((s) => ({ course, ...s }))))
  ).filter((s) => s.totalClasses > 0)
    .sort((a, b) => a.percentage - b.percentage);                // courses at risk first

  if (!summaries.length) {
    return h('section', { class: 'page' }, pageHead('My attendance', `${me.name} · ${me.rollNumber}`),
      h('div', { class: 'card' }, emptyBlock({ title: 'No attendance recorded yet',
        message: 'Once your teachers start taking attendance, your percentage for each course will show up here.' })));
  }

  let selected = summaries.find((s) => String(s.course.id) === query.get('course')) || summaries[0];
  const cards = h('div', { class: 'course-cards' });
  const history = h('div', { class: 'stack' });
  let token = 0;

  function drawCards() {
    replaceChildren(cards, summaries.map((s) => {
      const info = outlook(s.attended, s.totalClasses);
      const isSelected = s === selected;
      return h('button', { class: 'course-card card', type: 'button', 'aria-pressed': String(isSelected),
        onclick: () => { selected = s; window.history.replaceState(null, '', `#/my-attendance?course=${s.course.id}`); drawCards(); loadHistory(); } },
        h('span', { class: 'cc-top' }, h('strong', null, s.course.code), h('span', { class: 'muted small' }, s.course.name)),
        h('span', { class: `cc-pct cc-${info.tone} num` }, fmtPercent(s.percentage)),
        gauge(s.percentage, info.tone),
        h('span', { class: 'small muted num' }, `Attended ${s.attended} of ${s.totalClasses} classes`),
        h('span', { class: `cc-outlook cc-${info.tone}-text` }, info.text));
    }));
  }

  async function loadHistory() {
    const mine = ++token;
    replaceChildren(history, h('div', { class: 'card' }, loadingBlock(4)));
    try {
      const records = await api.get(`/api/attendance/student/${me.id}/course/${selected.course.id}`);
      if (mine !== token) return;
      const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
      const count = (st) => records.filter((r) => r.status === st).length;
      replaceChildren(history,
        h('div', { class: 'toolbar' }, h('h2', { class: 'grow' }, `${selected.course.code} history`),
          h('div', { class: 'register-summary' },
            [['PRESENT', 'present', 'Present'], ['LATE', 'late', 'Late'], ['ABSENT', 'absent', 'Absent'], ['EXCUSED', 'excused', 'Excused']].map(([st, tone, label]) =>
              h('span', { class: `tally tally-${tone}` }, h('strong', { class: 'num' }, count(st)), ` ${label}`)))),
        h('p', { class: 'small muted' }, 'Present and late count towards your percentage. Absent and excused do not.'),
        dataTable({ caption: `${selected.course.code} attendance history`, rows: sorted,
          columns: [
            { label: 'Date', render: (r) => fmtDate(r.date), className: 'num' },
            { label: 'Day', render: (r) => fmtWeekday(r.date) },
            { label: 'Mark', render: (r) => statusBadge(r.status) },
          ] }));
    } catch (err) {
      if (mine !== token) return;
      replaceChildren(history, h('div', { class: 'card' }, emptyBlock({ title: 'Could not load history', message: err.readable })));
      toast(err.readable, 'error');
    }
  }

  drawCards();
  loadHistory();
  return h('section', { class: 'page' },
    pageHead('My attendance', `${me.name} · ${me.rollNumber}. Courses closest to the ${REQUIRED_PERCENT}% line come first.`),
    cards, history);
}

export const route = {
  path: '/my-attendance', title: 'My attendance', roles: ['STUDENT'],
  nav: { label: 'My attendance', group: 'Attendance', icon: 'student', order: 1 },
  render,
};
