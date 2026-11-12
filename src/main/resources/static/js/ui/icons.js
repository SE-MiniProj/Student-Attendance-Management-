// Small stroke icons (20x20). Paths are static strings, so innerHTML is safe here.
const PATHS = {
  dashboard: '<rect x="3" y="3" width="6" height="6" rx="1.3"/><rect x="11" y="3" width="6" height="6" rx="1.3"/><rect x="3" y="11" width="6" height="6" rx="1.3"/><rect x="11" y="11" width="6" height="6" rx="1.3"/>',
  register: '<path d="M4 5h12M4 10h12M4 15h6"/><path d="M12.5 15l2 2 3.5-4.5"/>',
  report: '<path d="M4 16V9M10 16V4M16 16v-5"/>',
  student: '<circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c.7-3.2 3.1-5 6.5-5s5.8 1.8 6.5 5"/>',
  users: '<circle cx="8" cy="7" r="3"/><path d="M2.5 16.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/><path d="M13.3 4.3a3 3 0 010 5.4M15.6 12.3c1.5.6 2.5 2 2.9 4.2"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 015.5 3H16v13H5.5A1.5 1.5 0 004 17.5z"/><path d="M4 17.5A1.5 1.5 0 005.5 19H16"/>',
  calendar: '<rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/>',
  layers: '<path d="M10 3l7.5 4-7.5 4-7.5-4z"/><path d="M2.5 10.5l7.5 4 7.5-4M2.5 14l7.5 4 7.5-4"/>',
  enroll: '<circle cx="8" cy="7" r="3"/><path d="M2.5 16.5c.6-3 2.8-4.5 5.5-4.5 1 0 1.9.2 2.7.6"/><path d="M15 11v6M12 14h6"/>',
  logout: '<path d="M8 3H5a2 2 0 00-2 2v10a2 2 0 002 2h3M12 6.5L15.5 10 12 13.5M15.5 10H8"/>',
  menu: '<path d="M3 6h14M3 10h14M3 14h14"/>',
  close: '<path d="M5 5l10 10M15 5L5 15"/>',
  plus: '<path d="M10 4v12M4 10h12"/>',
  edit: '<path d="M12.5 4.5l3 3M4 16l.7-3.3L13.2 4.2a1.4 1.4 0 012 0l.6.6a1.4 1.4 0 010 2L7.3 15.3z"/>',
  trash: '<path d="M4 6h12M8 6V4h4v2M6 6l.6 10h6.8L14 6M8.5 9v4M11.5 9v4"/>',
  upload: '<path d="M10 13V4M6.5 7.5L10 4l3.5 3.5M4 13v3h12v-3"/>',
  download: '<path d="M10 4v9M6.5 9.5L10 13l3.5-3.5M4 13v3h12v-3"/>',
};

export function icon(name, size = 20) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = PATHS[name] || '';
  return svg;
}
