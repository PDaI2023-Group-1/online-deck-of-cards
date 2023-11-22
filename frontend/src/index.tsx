/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Routes, Route } from '@solidjs/router';
import { lazy } from 'solid-js';
import 'solid-devtools';
import App from './App';
import './index.css';
import BoxTest from './components/BoxTest/BoxTest';

const GameArea = lazy(() => import('./components/GameArea/GameArea'));
const CreateGuest = lazy(() => import('./components/User/CreateGuest'));
const CreateOrJoinRoom = lazy(
    () => import('./components/Rooms/CreateOrJoinRoom'),
);

const WaitingRoom = lazy(() => import('./components/Rooms/WaitingRoom'));

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
                <Route path="/user" component={CreateGuest} />
                <Route path="/room/create" component={CreateOrJoinRoom} />
                <Route path="/room/:roomCode" component={WaitingRoom} />
                <Route path="/game/:id" component={GameArea} />
                <Route path="/test/" component={BoxTest} />
            </Routes>
        </Router>
    ),
    root!,
);
