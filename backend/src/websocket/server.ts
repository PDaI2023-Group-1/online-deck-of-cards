import { createServer } from 'http';
import express = require('express');
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
const server = createServer(app);

app.use(cors({ origin: '*' }));

const wss = new WebSocketServer({ server });

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

// Define any additional routes you need
app.get('/', (req, res) => res.send('Hello World from WebSocket Server!'));

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
