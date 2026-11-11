// Form fields and a dialog that wraps them. Server validation errors
// ({ errors: { fieldName: message } }) are placed under the matching field.
import { h } from '../dom.js';
import { ApiError } from '../api.js';
import { modal } from './modal.js';

let uid = 0;

/**
 * field({ name, label, type, value, required, hint, options, ... })
 * type: text | email | password | number | date | select | textarea
 * options (select): [{ value, label }]
 * Returns { name, el, input, get value(), setError(message) }.
 */
export function field(spec) {
  const { name, label, type = 'text', options = [], value = '', required = false, hint, placeholder,
    autocomplete, min, max, step, maxlength, rows, readonly = false, disabled = false } = spec;
  const id = `field-${name}-${++uid}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  let input;

  if (type === 'select') {
    input = h('select', { class: 'select', id, name, required, disabled },
      options.map((o) => h('option', { value: o.value }, o.label)));
    input.value = value === null || value === undefined ? '' : String(value);
  } else if (type === 'textarea') {
    input = h('textarea', { class: 'textarea', id, name, required, rows: rows || 3, placeholder, maxlength, readOnly: readonly, disabled });
    input.value = value ?? '';
  } else {
    input = h('input', { class: 'input', id, name, type, required, placeholder, autocomplete, min, max, step, maxlength, readOnly: readonly, disabled });
    input.value = value ?? '';
  }
  if (hint) input.setAttribute('aria-describedby', hintId);

  const errorEl = h('p', { class: 'field-error', id: errorId, hidden: true });
  const el = h('div', { class: `field${spec.wide ? ' span-2' : ''}` },
    h('label', { for: id }, label, required && h('span', { class: 'muted', 'aria-hidden': 'true' }, ' *')),
    input,
    hint && h('p', { class: 'field-hint', id: hintId }, hint),
    errorEl,
  );

  const api = {
    name, el, input,
    get value() {
      const raw = input.value;
      if (type === 'number') return raw === '' ? null : Number(raw);
      if (type === 'password') return raw;
      return typeof raw === 'string' ? raw.trim() : raw;
    },
    setError(message) {
      errorEl.hidden = !message;
      errorEl.textContent = message || '';
      el.classList.toggle('has-error', Boolean(message));
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      const describedBy = [hint && hintId, message && errorId].filter(Boolean).join(' ');
      if (describedBy) input.setAttribute('aria-describedby', describedBy);
      else input.removeAttribute('aria-describedby');
    },
  };
  return api;
}

/**
 * formDialog({ title, intro, fields, submitLabel, onSubmit(values), wide })
 * `onSubmit` may throw an ApiError to keep the dialog open and show the problem.
 * Resolves to onSubmit's return value (or true), or null if the dialog was dismissed.
 */
export function formDialog({ title, intro, fields, submitLabel = 'Save', onSubmit, wide = false }) {
  return new Promise((resolve) => {
    const built = fields.map(field);
    const banner = h('div', { role: 'alert' });
    const submit = h('button', { class: 'btn btn-primary', type: 'submit' }, submitLabel);

    const showBanner = (text) => banner.replaceChildren(...(text ? [h('p', { class: 'form-error' }, text)] : []));

    const form = h('form', { class: 'form', novalidate: true,
      onsubmit: async (event) => {
        event.preventDefault();
        showBanner('');
        built.forEach((f) => f.setError(''));

        const missing = built.filter((f) => f.input.required && (f.value === '' || f.value === null));
        missing.forEach((f) => f.setError('Required'));
        if (missing.length) { missing[0].input.focus(); return; }

        const values = Object.fromEntries(built.map((f) => [f.name, f.value]));
        submit.disabled = true;
        submit.setAttribute('aria-busy', 'true');
        try {
          const result = await onSubmit(values);
          m.close(result === undefined ? true : result);
        } catch (err) {
          if (!(err instanceof ApiError)) throw err;
          const fieldErrors = err.fieldErrors || {};
          let placed = false;
          for (const f of built) {
            if (fieldErrors[f.name]) { f.setError(fieldErrors[f.name]); placed = true; }
          }
          if (placed) built.find((f) => fieldErrors[f.name])?.input.focus();
          else showBanner(err.readable);
          submit.disabled = false;
          submit.removeAttribute('aria-busy');
        }
      } },
      intro && h('p', { class: 'muted' }, intro),
      h('div', { class: 'form-grid' }, built.map((f) => f.el)),
      banner,
      h('div', { class: 'form-actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => m.close(null) }, 'Cancel'),
        submit),
    );

    const m = modal({ title, content: form, wide, onClose: resolve });
    (built.find((f) => !f.input.readOnly && !f.input.disabled) || built[0])?.input.focus();
  });
}
