'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var http_1 = require('http');
var express = require('express');
var ws_1 = require('ws');
var app = express();
var server = (0, http_1.createServer)(app);
var wss = new ws_1.WebSocketServer({ server: server });
wss.on('connection', function (ws) {
    console.log('A new client Connected');
    ws.send(JSON.stringify({ message: 'Welcome New Client!' }));
    ws.on('message', function (data) {
        var message = JSON.parse(data);
        // Handle only 'move-box' type messages
        if (message.type === 'move-box') {
            // Broadcast the new position to all clients except the sender
            wss.clients.forEach(function (client) {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    });
    ws.on('error', function (error) {
        return console.error('WebSocket error:', error);
    });
});
// Define any additional routes you need
app.get('/', function (req, res) {
    return res.send('Hello World from WebSocket Server!');
});
// Start the server
var PORT = 3000;
server.listen(PORT, function () {
    console.log('Server is listening on port '.concat(PORT));
});
