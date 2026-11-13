// Reusable building blocks shared by the pages.
import { h } from '../dom.js';
import { icon } from './icons.js';
import { toast } from './toast.js';

export function pageHead(title, subtitle, actions) {
  return h('header', { class: 'page-head' },
    h('div', null, h('h1', null, title), subtitle && h('p', null, subtitle)),
    actions && h('div', { class: 'page-actions' }, actions),
  );
}

/** A coloured pill. tone: neutral | pen | present | absent | late | excused */
export function badge(text, tone = 'neutral') {
  return h('span', { class: `badge badge-${tone}` }, text);
}

export function emptyBlock({ title, message, action }) {
  return h('div', { class: 'empty-block' },
    h('h3', null, title),
    message && h('p', { class: 'muted' }, message),
    action,
  );
}

export function loadingBlock(lines = 4) {
  return h('div', { class: 'skeleton', 'aria-hidden': 'true' },
    Array.from({ length: lines }, (_, i) => h('div', { class: 'skeleton-line', style: `width:${92 - i * 11}%` })));
}

/**
 * dataTable({ caption, columns, rows, empty })
 * columns: [{ label, render(row) -> Node|string, align?: 'end', className? }]
 */
export function dataTable({ caption, columns, rows, empty }) {
  if (!rows.length) return h('div', { class: 'card' }, emptyBlock(empty || { title: 'Nothing here yet' }));
  return h('div', { class: 'table-wrap card' },
    h('table', { class: 'table' },
      caption && h('caption', { class: 'sr-only' }, caption),
      h('thead', null, h('tr', null, columns.map((c) => h('th', { scope: 'col', class: c.align === 'end' ? 'end' : null }, c.label)))),
      h('tbody', null, rows.map((row) => h('tr', null, columns.map((c) =>
        h('td', { class: [c.align === 'end' ? 'end' : '', c.className || ''].join(' ').trim() || null }, c.render(row)))))),
    ),
  );
}

/** Icon buttons for a table row: [{ label, icon, onclick, danger }] */
export function rowActions(actions) {
  return h('div', { class: 'row-actions' }, actions.filter(Boolean).map((a) =>
    h('button', { class: `icon-btn${a.danger ? ' icon-btn-danger' : ''}`, type: 'button', title: a.label, 'aria-label': a.label, onclick: a.onclick }, icon(a.icon, 18))));
}

/** A search field that calls onInput(text) as the user types. */
export function searchBox({ label, placeholder, onInput }) {
  return h('div', { class: 'search' },
    h('label', { class: 'sr-only', for: 'search-box' }, label),
    h('input', { class: 'input', id: 'search-box', type: 'search', placeholder, autocomplete: 'off', oninput: (e) => onInput(e.target.value.trim().toLowerCase()) }));
}

/**
 * Run an async task while a button shows a busy state. Failures become an error toast.
 * Resolves to { ok, value } or { ok: false, error } and never throws.
 */
export async function run(button, task, successMessage) {
  if (button) { button.setAttribute('aria-busy', 'true'); button.disabled = true; }
  try {
    const value = await task();
    if (successMessage) toast(successMessage);
    return { ok: true, value };
  } catch (error) {
    toast(error.readable || error.message || 'Something went wrong.', 'error');
    return { ok: false, error };
  } finally {
    if (button) { button.removeAttribute('aria-busy'); button.disabled = false; }
  }
}
