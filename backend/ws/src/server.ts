import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
/* 
interface BoxPosition {
    type: 'move-box';
    payload: {
        x: number;
        y: number;
    };
} */

wss.on('connection', (ws: WebSocket) => {
    console.log('A new client Connected');

    ws.send(JSON.stringify({ message: 'Welcome New Client!' }));

    ws.on('message', (data: string) => {
        const message: BaseMessage = JSON.parse(data);

        if (message.event === 'move-box') {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }

        if (message.event === 'move-card') {
            const msg = message as UpdateCardPosition;
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({
                            event: message.event,
                            payload: msg.payload,
                        })
                    );
                }
            });
        }
    });

    ws.on('error', (error) => console.error('WebSocket error:', error));
});
