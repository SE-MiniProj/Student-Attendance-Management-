// Page registry. Each page exports a `route` object:
//   { path, title, roles?, nav?: { label, group, order }, render(ctx) -> Node | Promise<Node> }
// `nav` puts the page in the sidebar; `roles` limits who can open it (omit = any signed-in user).
// Pages are added here as they are built.
export const routes = [];
