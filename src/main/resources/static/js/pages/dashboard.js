// Landing page. What it shows depends on the role.
import { api } from '../api.js';
import { h, fmtDate, fmtWeekday, fmtPercent, todayISO } from '../dom.js';
import { pageHead, badge, emptyBlock } from '../ui/components.js';
import { REQUIRED_PERCENT } from '../ui/status.js';
import { outlook } from './myAttendance.js';

function greeting(name) {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const who = /^(Dr|Prof)\.?\s/.test(name) ? name : name.split(' ')[0];   // keep titles, drop surnames otherwise
  return `${part}, ${who}`;
}

const today = () => `${fmtWeekday(todayISO())}, ${fmtDate(todayISO())}`;
const stat = (label, value, hint) => h('div', { class: 'stat card' },
  h('span', { class: 'small muted' }, label), h('strong', { class: 'stat-value num' }, value), hint && h('span', { class: 'small muted' }, hint));

// --- admin -----------------------------------------------------------------
async function adminView(user) {
  const [users, courses, semesters, sections] = await Promise.all([
    api.get('/api/admin/users'), api.get('/api/courses'), api.get('/api/admin/semesters'), api.get('/api/admin/sections'),
  ]);
  const count = (role) => users.filter((u) => u.role === role && u.active).length;
  const activeSemesters = semesters.filter((s) => s.active);

  const link = (href, title, text) => h('a', { class: 'card go-card', href }, h('strong', null, title), h('span', { class: 'muted small' }, text));

  return h('section', { class: 'page' },
    pageHead(greeting(user.fullName), today()),
    h('div', { class: 'stats' },
      stat('Active students', count('STUDENT')),
      stat('Active teachers', count('TEACHER')),
      stat('Courses', courses.length),
      stat('Sections', sections.length, activeSemesters.length ? `Active semester: ${activeSemesters.map((s) => s.name).join(', ')}` : 'No active semester')),
    h('h2', null, 'Set up and manage'),
    h('div', { class: 'go-grid' },
      link('#/admin/users', 'Users', 'Add students and teachers, or deactivate an account.'),
      link('#/admin/courses', 'Courses', 'The catalogue sections are created from.'),
      link('#/admin/semesters', 'Semesters', 'Define terms and mark which are active.'),
      link('#/admin/sections', 'Sections', 'Assign a teacher to a course in a semester.'),
      link('#/admin/enrollments', 'Enrollments', 'Build class lists, one by one or from a CSV.'),
      link('#/reports', 'Class report', 'See who is below the attendance line.')),
  );
}

// --- teacher ---------------------------------------------------------------
async function teacherView(user) {
  const sections = (await api.get('/api/admin/sections')).filter((s) => s.teacherId === user.userId);
  const date = todayISO();

  const details = await Promise.all(sections.map(async (s) => {
    const [roster, records] = await Promise.all([
      api.get(`/api/admin/enrollments/section/${s.id}`),
      api.get(`/api/attendance/course/${s.courseId}`, { date }),
    ]);
    return { section: s, students: roster.length, taken: records.length > 0 };
  }));

  const body = !details.length
    ? h('div', { class: 'card' }, emptyBlock({ title: 'No sections assigned yet', message: 'When an administrator assigns you to a section, it will show up here.' }))
    : h('div', { class: 'course-cards' }, details.map(({ section: s, students, taken }) => h('div', { class: 'card section-card' },
        h('div', { class: 'cc-top' }, h('strong', null, `${s.courseCode} · Section ${s.sectionName}`), h('span', { class: 'muted small' }, s.courseName)),
        h('p', { class: 'small muted' }, [s.semesterName, s.room, `${students} ${students === 1 ? 'student' : 'students'}`].filter(Boolean).join(' · ')),
        taken ? badge('Taken today', 'present') : badge('Not taken yet', 'late'),
        h('div', { class: 'section-actions' },
          h('a', { class: `btn btn-sm${taken ? '' : ' btn-primary'}`, href: `#/attendance/mark?section=${s.id}&date=${date}` }, taken ? 'View today' : 'Take attendance'),
          h('a', { class: 'btn btn-sm btn-quiet', href: `#/reports?section=${s.id}` }, 'Class report')))));

  return h('section', { class: 'page' }, pageHead(greeting(user.fullName), today()), h('h2', null, 'Your sections'), body);
}

// --- student ---------------------------------------------------------------
async function studentView(user) {
  let me;
  try { me = await api.get('/api/students/me'); }
  catch (err) {
    if (err.status !== 404) throw err;
    return h('section', { class: 'page' }, pageHead(greeting(user.fullName), today()),
      h('div', { class: 'card' }, emptyBlock({ title: 'No student record yet', message: 'Your account is not linked to a student record. Ask an administrator to check your roll number.' })));
  }
  const courses = await api.get('/api/courses');
  const summaries = (await Promise.all(courses.map((course) =>
    api.get(`/api/attendance/student/${me.id}/course/${course.id}/summary`).then((s) => ({ course, ...s })))))
    .filter((s) => s.totalClasses > 0).sort((a, b) => a.percentage - b.percentage);

  if (!summaries.length) {
    return h('section', { class: 'page' }, pageHead(greeting(user.fullName), today()),
      h('div', { class: 'card' }, emptyBlock({ title: 'No attendance recorded yet', message: 'Once your teachers start taking attendance, it will appear here.' })));
  }

  const attended = summaries.reduce((n, s) => n + s.attended, 0);
  const total = summaries.reduce((n, s) => n + s.totalClasses, 0);
  const overall = Math.round((attended / total) * 1000) / 10;
  const atRisk = summaries.filter((s) => s.percentage < REQUIRED_PERCENT);

  return h('section', { class: 'page' },
    pageHead(greeting(user.fullName), `${today()} · ${me.rollNumber}`),
    h('div', { class: 'stats' },
      stat('Overall attendance', fmtPercent(overall), `${attended} of ${total} classes`),
      stat('Courses', summaries.length),
      h('div', { class: 'stat card' }, h('span', { class: 'small muted' }, `Below ${REQUIRED_PERCENT}%`),
        h('strong', { class: `stat-value num${atRisk.length ? ' stat-absent' : ''}` }, atRisk.length),
        h('span', { class: 'small muted' }, atRisk.length ? 'Needs attention' : 'You are on track everywhere'))),
    h('div', { class: 'toolbar' }, h('h2', { class: 'grow' }, atRisk.length ? 'Needs attention first' : 'Your courses'),
      h('a', { class: 'btn', href: '#/my-attendance' }, 'See full history')),
    h('div', { class: 'card table-wrap' }, h('ul', { class: 'plain-list' }, summaries.map((s) => {
      const info = outlook(s.attended, s.totalClasses);
      return h('li', null, h('a', { class: 'list-row', href: `#/my-attendance?course=${s.course.id}` },
        h('span', { class: 'cc-top' }, h('strong', null, s.course.code), h('span', { class: 'muted small' }, info.text)),
        h('strong', { class: `num cc-${info.tone}` }, fmtPercent(s.percentage))));
    }))));
}

async function render({ user }) {
  if (user.role === 'ADMIN') return adminView(user);
  if (user.role === 'TEACHER') return teacherView(user);
  return studentView(user);
}

export const route = {
  path: '/', title: 'Dashboard',
  nav: { label: 'Dashboard', group: '', icon: 'dashboard', order: 0 },
  render,
};
