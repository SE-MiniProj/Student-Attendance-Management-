// Dialogs built on the native <dialog> element, which gives us a focus trap,
// Escape-to-close and focus restoration for free.
import { h } from '../dom.js';
import { icon } from './icons.js';

let uid = 0;

/**
 * modal({ title, content, wide, onClose })
 * Returns { dialog, close(value) }. `onClose(value)` runs once the dialog has closed;
 * value is whatever was passed to close() (null if dismissed with Esc or the backdrop).
 */
export function modal({ title, content, wide = false, onClose }) {
  const titleId = `modal-title-${++uid}`;
  let result = null;

  const dialog = h('dialog', { class: `modal${wide ? ' modal-wide' : ''}`, 'aria-labelledby': titleId },
    h('div', { class: 'modal-head' },
      h('h2', { id: titleId }, title),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: () => api.close(null) }, icon('close')),
    ),
    h('div', { class: 'modal-body' }, content),
  );

  dialog.addEventListener('click', (e) => { if (e.target === dialog) api.close(null); });   // backdrop
  dialog.addEventListener('close', () => { dialog.remove(); onClose?.(result); });

  const api = {
    dialog,
    close(value = null) { result = value; if (dialog.open) dialog.close(); },
  };

  document.body.append(dialog);
  dialog.showModal();
  return api;
}

/** confirmDialog({ title, message, confirmLabel, danger }) -> Promise<boolean> */
export function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    const ok = h('button', { class: `btn ${danger ? 'btn-danger btn-solid' : 'btn-primary'}`, type: 'button', onclick: () => m.close(true) }, confirmLabel);
    const m = modal({
      title,
      content: h('div', { class: 'stack' },
        h('p', null, message),
        h('div', { class: 'form-actions' }, h('button', { class: 'btn', type: 'button', onclick: () => m.close(false) }, 'Cancel'), ok),
      ),
      onClose: (value) => resolve(value === true),
    });
    // Destructive actions: start on Cancel so Enter cannot delete by accident.
    (danger ? m.dialog.querySelector('.form-actions .btn') : ok).focus();
  });
}
