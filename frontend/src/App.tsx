import type { Component } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';

const App: Component = () => {
    const nav = useNavigate();

    return (
        <div
            class="app-container"
            style={{
                display: 'flex',
                'flex-direction': 'column',
                width: '25%',
            }}
        >
            <A href={`/game/${Math.floor(Math.random() * 1000000)}`}>
                <button>Create game</button>
            </A>

            <button onClick={() => nav('/user')}>Create user</button>
            <button onClick={() => nav('/test/')}>Box test</button>
        </div>
    );
};

export default App;
