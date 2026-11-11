import './session.js';
import { startRouter } from './router.js';
import { replaceChildren } from './dom.js';
import { shell } from './ui/shell.js';

const app = document.getElementById('app');

startRouter(
  (route, content) => {
    if (route.bare) {
      shell.reset();
      replaceChildren(app, content);
    } else {
      shell.show(app, route, content);
    }
  },
  (route) => { if (!route.bare) shell.busy(); },
);
