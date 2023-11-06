import type { Component } from 'solid-js';
import { A } from '@solidjs/router';

const App: Component = () => {
    return (
        <div
            class="app-container"
            style={{
                display: 'flex',
                'flex-direction': 'column',
                width: '25%',
            }}
        >
            <button>
                <A href={`/game/${Math.floor(Math.random() * 1000000)}`}>
                    Create game
                </A>
            </button>
        </div>
    );
};

export default App;
