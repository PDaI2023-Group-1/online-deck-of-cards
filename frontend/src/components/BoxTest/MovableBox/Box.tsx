import { createSignal, onCleanup } from 'solid-js';

interface BoxProps {
    ws: WebSocket;
    position: { x: number; y: number };
}

const Box = (props: BoxProps) => {
    const [boxRef, setBoxRef] = createSignal<HTMLDivElement>();

    const updatePosition = (event: MouseEvent) => {
        const newPosition = { x: event.clientX - 50, y: event.clientY - 50 };
        // Send the new position to the WebSocket server
        props.ws.send(
            JSON.stringify({ type: 'move-box', payload: newPosition }),
        );
    };

    const onMouseMove = (event: MouseEvent) => {
        updatePosition(event);
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = () => {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    onCleanup(() => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    });

    return (
        <div
            ref={boxRef()}
            style={{
                width: '100px',
                height: '100px',
                background: 'blue',
                position: 'absolute',
                left: props.position.x + 'px',
                top: props.position.y + 'px',
                cursor: 'pointer',
            }}
            onMouseDown={onMouseDown}
        />
    );
};

export default Box;
