import type { Component } from 'solid-js';
import { A } from '@solidjs/router';

const App: Component = () => {
    return (
        <div class="app-container">
            <button>
                {/* Create smarter id generation, also needs to be posted to backend later */}
                <A href={`/game/${Math.floor(Math.random() * 1000000)}`}>
                    Create game
                </A>
            </button>
        </div>
    );
};

export default App;
