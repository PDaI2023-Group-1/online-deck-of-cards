import type { Component } from 'solid-js';
import { createSignal, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import Box from './components/GameArea/MovableBox/Box';

const App: Component = () => {
    const [ws, setWs] = createSignal<WebSocket | null>(null);
    const [position, setPosition] = createSignal({ x: 100, y: 100 });

    onMount(() => {
        const newWs = new WebSocket('ws://localhost:3000');
        setWs(newWs);

        newWs.onmessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.type === 'move-box') {
                setPosition(data.payload);
            }
        };

        newWs.onopen = () => console.log('Connected to WebSocket server');
        newWs.onerror = (error) => console.error('WebSocket error:', error);
        newWs.onclose = () => console.log('Disconnected from WebSocket server');
    });

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
                {ws() && <Box ws={ws() as WebSocket} position={position()} />}
            </button>
        </div>
    );
};

export default App;
