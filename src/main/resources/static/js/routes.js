// Page registry. Each page exports a `route` object:
//   { path, title, roles?, nav?: { label, group, order }, bare?, render(ctx) -> Node | Promise<Node> }
// `nav` puts the page in the sidebar; `roles` limits who can open it (omit = any signed-in user);
// `bare` renders without the app shell (login).
import { route as login } from './pages/login.js';
import { route as users } from './pages/users.js';
import { route as courses } from './pages/courses.js';
import { route as semesters } from './pages/semesters.js';
import { route as sections } from './pages/sections.js';

export const routes = [
  login,
  users,
  courses,
  semesters,
  sections,
];
