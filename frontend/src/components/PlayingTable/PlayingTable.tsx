import { Component, createSignal, onMount } from 'solid-js';
import './PlayingTableStyles.css';

let canvasRef: HTMLCanvasElement | undefined;

const PlayingTable: Component = () => {
    const [pos, setPos] = createSignal({ x: 0, y: 0 });

    onMount(() => {
        canvasRef = document.getElementById('play-area') as HTMLCanvasElement;
    });

    const handleMouseMove = (event: MouseEvent) => {
        if (canvasRef) {
            setPos({ x: event.offsetX, y: event.offsetY });
        }
    };

    const handleClick = () => {
        canvasRef = document.getElementById('play-area') as HTMLCanvasElement;

        if (canvasRef) {
            const ctx = canvasRef.getContext('2d');

            ctx?.fillRect(pos().x, pos().y, 10, 10);
        }
    };

    return (
        <div id="pt-container">
            <p>
                POS &gt x: {pos().x} y: {pos().y}
            </p>
            <canvas
                id="play-area"
                onMouseMove={(event) => handleMouseMove(event)}
                onClick={handleClick}
                width={'600px'}
                height={'600px'}
            />
        </div>
    );
};

export default PlayingTable;
