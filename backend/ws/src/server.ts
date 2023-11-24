import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { verify } from './helpers/token';

const wss = new WebSocketServer({ port: 8080 });

const playerIdsByWebsockets = new Map<WebSocket, number>();
const playerData = new Map<number, Token>();
const rooms = new Map<string, Room>();

if (process.env.SECRET_KEY === undefined || process.env.SECRET_KEY === null) {
    console.error('SECRET_KEY is not defined');
    process.exit(1);
}

wss.on('connection', (ws: WebSocket) => {
    console.log('A new client Connected');

    ws.on('message', (data: string) => {
        const message: WSData = JSON.parse(data);

        if (!playerIdsByWebsockets.has(ws) && message.event !== 'authorize') {
            ws.send(
                JSON.stringify({
                    event: 'unauthorized',
                })
            );
            return;
        }

        if (message.event === 'authorize') {
            verify(message.token)
                .then((decoded) => {
                    playerIdsByWebsockets.set(ws, decoded.id);
                    playerData.set(decoded.id, decoded);

                    ws.send(
                        JSON.stringify({
                            event: 'authorized',
                        })
                    );
                })
                .catch((err) => {
                    console.log(err);
                    ws.send(
                        JSON.stringify({
                            event: 'unauthorized',
                        })
                    );
                });
        }

        if (message.event === 'move-card') {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }

        if (message.event === 'create-room') {
            const playerId = playerIdsByWebsockets.get(ws);
            if (playerId === undefined) {
                console.log('player id undefined');
                return;
            }

            const player = playerData.get(playerId);

            if (player === undefined) {
                console.log('player data undefined');
                return;
            }

            if (!player.isOwner) {
                console.log('user cant create room if user is not owner');
                return;
            }

            if (rooms.has(player.roomCode)) {
                console.log('room exists');
                return;
            }

            const room: Room = {
                maxPlayers: player.maxPlayers!,
                players: [ws],
            };

            rooms.set(player.roomCode, room);
            console.log('room created');
            ws.send(JSON.stringify({ event: 'room-created' }));
        }

        if (message.event === 'join-room') {
            const playerId = playerIdsByWebsockets.get(ws);
            if (playerId === undefined) {
                console.log('player id undefined');
                return;
            }

            const player = playerData.get(playerId);

            if (player === undefined) {
                console.log('player data undefined');
                return;
            }

            const room = rooms.get(player.roomCode);
            if (room === undefined) {
                console.log('room not found when joining');
                return;
            }

            if (room.players.length >= room.maxPlayers) {
                ws.send(
                    JSON.stringify({
                        event: 'room-full',
                    })
                );
                return;
            }

            ws.send(
                JSON.stringify({
                    event: 'joined-room',
                })
            );

            // loop over current players and send player-joined to self

            room.players.forEach((socket: WebSocket) => {
                const playerId = playerIdsByWebsockets.get(socket);
                if (playerId === undefined) {
                    console.log('player id undefined');
                    return;
                }
                const player = playerData.get(playerId);

                if (player === undefined) {
                    console.log('player data undefined');
                    return;
                }

                ws.send(
                    JSON.stringify({
                        event: 'player-joined',
                        username: player.username,
                    })
                );
            });

            // send player-joined event to others that are in the room

            const newPlayerSockets = [...room.players, ws];
            room.players = newPlayerSockets;
            rooms.set(player.roomCode, room);

            newPlayerSockets.forEach((socket) => {
                if (socket === ws) {
                    return;
                }
                socket.send(
                    JSON.stringify({
                        event: 'player-joined',
                        username: player.username,
                    })
                );
            });
        }
    });

    ws.on('error', (error) => console.error('WebSocket error:', error));
});
