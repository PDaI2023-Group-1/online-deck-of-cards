import { onMount, createSignal } from 'solid-js';
import Box from './MovableBox/Box';

const BoxTest = () => {
    const [ws, setWs] = createSignal<WebSocket | null>(null);
    const [position, setPosition] = createSignal({ x: 100, y: 100 });

    onMount(() => {
        const newWs = new WebSocket('ws://localhost:8080');
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
            {ws() && <Box ws={ws() as WebSocket} position={position()} />}
        </div>
    );
};

export default BoxTest;
