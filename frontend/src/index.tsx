/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Routes, Route } from '@solidjs/router';
import { lazy } from 'solid-js';
import 'solid-devtools';

import App from './App';

const GameArea = lazy(() => import('./components/GameArea/GameArea'));

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
    );
}

render(
    () => (
        <Router>
            <Routes>
                <Route path="/" component={App} />
                <Route path="/game/:id" component={GameArea} />
            </Routes>
        </Router>
    ),
    root!,
);
