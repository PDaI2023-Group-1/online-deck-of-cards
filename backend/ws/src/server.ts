import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { verify } from './utils/token';

const wss = new WebSocketServer({ port: 8080 });

import {
    hasSocket,
    setSocket,
    setPlayerData,
    getPlayerDataBySocket,
    removePlayerData,
    removePlayerIdBySocket,
    getSocketByPlayerId,
} from './utils/user';

import { getRoomByCode, setRoomByCode, removeRoomByCode } from './utils/room';

if (process.env.SECRET_KEY === undefined || process.env.SECRET_KEY === null) {
    console.error('SECRET_KEY is not defined');
    process.exit(1);
}

const removePlayer = (ws: WebSocket) => {
    const player = getPlayerDataBySocket(ws);

    if (player === undefined) {
        return;
    }

    const room = getRoomByCode(player.roomCode);
    if (room === undefined) {
        return;
    }

    const players = room.players.filter((socket: WebSocket) => socket !== ws);

    room.players = players;
    setRoomByCode(player.roomCode, room);

    players.forEach((socket: WebSocket) => {
        socket.send(
            JSON.stringify({
                event: 'player-left',
                username: player.username,
                id: player.id,
            })
        );
    });

    if (player.isOwner) {
        removeRoomByCode(player.roomCode);
        players.forEach((socket: WebSocket) => {
            socket.send(JSON.stringify({ event: 'room-closed' }));
            socket.close();
        });
    }

    removePlayerIdBySocket(ws);
    removePlayerData(player.id);
};

wss.on('connection', (ws: WebSocket) => {
    console.log('A new client Connected');

    ws.on('message', (data: string) => {
        const message: WSData = JSON.parse(data);

        if (!hasSocket(ws) && message.event !== 'authorize') {
            ws.send(
                JSON.stringify({
                    event: 'unauthorized',
                })
            );
            ws.close();
            return;
        }

        if (message.event === 'authorize') {
            verify(message.token)
                .then((decoded) => {
                    setSocket(ws, decoded.id);
                    setPlayerData(decoded.id, decoded);

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
                    ws.close();
                });
        }

        if (message.event === 'move-card') {
            const player = getPlayerDataBySocket(ws);

            if (player === undefined) {
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                return;
            }

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws
            );

            players.forEach((socket: WebSocket) => {
                socket.send(JSON.stringify(message));
            });
        }

        if (message.event === 'create-room') {
            const player = getPlayerDataBySocket(ws);

            if (player === undefined) {
                ws.send(JSON.stringify({ event: 'room-create-fail' }));
                return;
            }

            if (!player.isOwner) {
                ws.send(JSON.stringify({ event: 'room-create-fail' }));
                return;
            }

            const room: Room = {
                maxPlayers: player.maxPlayers!,
                players: [ws],
                settings: {
                    deckCount: 1,
                    cardsPerPlayer: 0,
                    jokerCount: 0,
                },
                isGameStarted: false,
            };

            setRoomByCode(player.roomCode, room);
            ws.send(JSON.stringify({ event: 'room-created' }));
        }

        if (message.event === 'join-room') {
            const player = getPlayerDataBySocket(ws);

            if (player === undefined) {
                ws.send(JSON.stringify({ event: 'join-room-fail' }));
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                ws.send(JSON.stringify({ event: 'join-room-fail' }));
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
                    settings: room.settings,
                })
            );

            // loop over current players and send player-joined to self

            room.players.forEach((socket: WebSocket) => {
                const player = getPlayerDataBySocket(socket);
                if (player === undefined) {
                    return;
                }

                ws.send(
                    JSON.stringify({
                        event: 'player-joined',
                        username: player.username,
                        id: player.id,
                    })
                );
            });

            // send player-joined event to others that are in the room

            room.players.forEach((socket: WebSocket) => {
                socket.send(
                    JSON.stringify({
                        event: 'player-joined',
                        username: player.username,
                        id: player.id,
                    })
                );
            });

            const newPlayerSockets = [...room.players, ws];
            room.players = newPlayerSockets;
            setRoomByCode(player.roomCode, room);

            if (room.isGameStarted) {
                ws.send(
                    JSON.stringify({
                        event: 'game-started',
                    })
                );
            }
        }

        if (message.event === 'flip-card') {
            const player = getPlayerDataBySocket(ws);
            if (player === undefined) {
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                return;
            }

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws
            );

            players.forEach((socket: WebSocket) => {
                socket.send(JSON.stringify(message));
            });
        }

        if (message.event === 'room-data-changed') {
            const player = getPlayerDataBySocket(ws);
            if (player === undefined) {
                return;
            }

            if (player.isOwner === false) {
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                return;
            }

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws
            );

            if (message.valueType === 'deck-count') {
                room.settings.deckCount = message.value;
            }
            if (message.valueType === 'cards-per-player') {
                room.settings.cardsPerPlayer = message.value;
            }
            if (message.valueType === 'joker-count') {
                room.settings.jokerCount = message.value;
            }

            players.forEach((socket: WebSocket) => {
                socket.send(
                    JSON.stringify({
                        event: 'room-data-changed',
                        valueType: message.valueType,
                        value: message.value,
                    })
                );
            });
        }

        if (message.event === 'start-game') {
            const player = getPlayerDataBySocket(ws);

            if (player === undefined) {
                console.log('player data undefined');
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                console.log('room not found');
                return;
            }

            room.isGameStarted = true;
            setRoomByCode(player.roomCode, room);

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws
            );

            players.forEach((socket: WebSocket) => {
                socket.send(
                    JSON.stringify({
                        event: 'game-started',
                    })
                );
            });
        }

        if (message.event === 'kick-player') {
            const player = getPlayerDataBySocket(ws);
            if (player === undefined) {
                return;
            }

            if (player.isOwner === false) {
                return;
            }

            const socket = getSocketByPlayerId(message.playerId);
            if (socket === undefined) {
                return;
            }
            socket.send(JSON.stringify({ event: 'player-kicked' }));
            removePlayer(socket);
            socket.close();
        }

        if (message.event === 'hide-card' || message.event === 'show-card') {
            const player = getPlayerDataBySocket(ws);
            if (player === undefined) {
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                return;
            }

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws
            );

            players.forEach((socket: WebSocket) => {
                socket.send(JSON.stringify(message));
            });
        }
    });

    ws.onclose = () => {
        console.log('A client disconnected');
        removePlayer(ws);
    };

    ws.on('error', (error) => console.error('WebSocket error:', error));
});
