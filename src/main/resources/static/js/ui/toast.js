// Brief confirmation / error messages in the corner of the screen.
let region = null;

function ensureRegion() {
  if (region && document.body.contains(region)) return region;
  region = document.createElement('div');
  region.className = 'toasts';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.append(region);
  return region;
}

export function toast(message, kind = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  if (kind === 'error') el.setAttribute('role', 'alert');

  const text = document.createElement('span');
  text.textContent = message;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast-close';
  close.setAttribute('aria-label', 'Dismiss message');
  close.textContent = '×';

  const remove = () => el.remove();
  close.addEventListener('click', remove);
  el.append(text, close);
  ensureRegion().append(el);
  setTimeout(remove, kind === 'error' ? 8000 : 4000);
}
