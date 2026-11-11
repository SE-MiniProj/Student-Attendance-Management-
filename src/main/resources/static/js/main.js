import { session } from './session.js';
import { startRouter } from './router.js';
import { replaceChildren } from './dom.js';

const app = document.getElementById('app');

// Until the layout exists, pages are mounted straight into #app.
startRouter((route, content) => {
  replaceChildren(app, content);
});

export { session };
