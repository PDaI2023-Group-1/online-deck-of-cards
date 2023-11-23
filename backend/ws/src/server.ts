import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface BoxPosition {
    type: 'move-box';
    payload: {
        x: number;
        y: number;
    };
}

wss.on('connection', (ws: WebSocket) => {
    console.log('A new client Connected');

    ws.send(JSON.stringify({ message: 'Welcome New Client!' }));

    ws.on('message', (data: string) => {
        const message: BoxPosition = JSON.parse(data);

        if (message.type === 'move-box') {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    });

    ws.on('error', (error) => console.error('WebSocket error:', error));
});
