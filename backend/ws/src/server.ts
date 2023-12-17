import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { verify } from './utils/token';
import { WSData } from '../types/custom/index';
import { ICardProps } from '../types/custom/index';
import { Token, Room } from '../types/custom/index';
import { ECardSuit } from '../types/custom/index';
import { ECardState } from '../types/custom/index';
import { GamePhase } from '../types/custom/index';

const wss = new WebSocketServer({ port: 8080 });
console.log(`WebSocket Server started on port 8080`);

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

function isPlayerTurn(player: Token, room: Room): boolean {
    return parseInt(room.gameState.currentPlayerId) === player.id;
}

function broadcastGameState(room: Room): void {
    room.players.forEach((socket: WebSocket) => {
        socket.send(
            JSON.stringify({
                event: 'game-state-update',
                gameState: room.gameState,
            }),
        );
    });
}

function initializeDeck(): Array<ICardProps> {
    let deck: Array<ICardProps> = [];
    let cardIdCounter = 1;

    const suits: ECardSuit[] = [
        ECardSuit.diamond,
        ECardSuit.heart,
        ECardSuit.ace,
        ECardSuit.spade,
    ];
    const values: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    suits.forEach((suit) => {
        values.forEach((value) => {
            deck.push({
                id: cardIdCounter++, //replace with actual id
                pos: { x: 0, y: 0 },
                isFaceUp: false,
                order: cardIdCounter++, //replace with actual order
                cardState: ECardState.inDeck,
                playerId: '',
                value: value,
                suit: suit,
            });
        });
    });

    deck = shuffle(deck);

    return deck;
}

// Example shuffle function
function shuffle(deck: Array<ICardProps>): Array<ICardProps> {
    //Fisher-Yates (Durstenfeld) shuffle algorithm
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function endTurn(roomCode: string): void {
    const room = getRoomByCode(roomCode);

    if (!room) {
        return;
    }

    room.gameState.currentPlayerId = determineNextPlayerId(room);

    broadcastGameState(room);
}

function determineNextPlayerId(room: Room): string {
    const currentPlayerIndex = room.playerIds.findIndex(
        (id) => id === room.gameState.currentPlayerId,
    );

    let nextPlayerIndex = (currentPlayerIndex + 1) % room.playerIds.length;

    return room.playerIds[nextPlayerIndex];
}

const removePlayer = (ws: WebSocket) => {
    const player = getPlayerDataBySocket(ws);

    if (player === undefined) {
        console.log(
            `Failed to remove player. Player data undefined. Player might have been removed already`
        );
        return;
    }

    const room = getRoomByCode(player.roomCode);
    if (room === undefined) {
        console.log(`Failed to remove player. Room does not exist`);
        return;
    }

    const updatePlayers = room.players.filter(
        (socket: WebSocket) => socket !== ws,
    );

    room.players = updatePlayers;
    setRoomByCode(player.roomCode, room);

    updatePlayers.forEach((socket: WebSocket) => {
        socket.send(
            JSON.stringify({
                event: 'player-left',
                username: player.username,
                id: player.id,
                gameState: room.gameState,
            }),
        );
    });

    if (player.isOwner) {
        removeRoomByCode(player.roomCode);
        room.players.forEach((socket: WebSocket) => {
            socket.send(JSON.stringify({ event: 'room-closed' }));
            socket.close();
        });
    }

    removePlayerIdBySocket(ws);
    removePlayerData(player.id);
    console.log(
        `Player: ${player.username} has been removed from room ${player.roomCode}`
    );
};

wss.on('connection', (ws: WebSocket) => {
    console.log('A new client Connected');

    ws.on('message', (data: string) => {
        const message: WSData = JSON.parse(data);
        const player = getPlayerDataBySocket(ws);

        if (!hasSocket(ws) && message.event !== 'authorize') {
            ws.send(
                JSON.stringify({
                    event: 'unauthorized',
                }),
            );
            ws.close();
            console.log('Client has not been authorized. Closing socket');
            return;
        }

        if (!player) {
            console.error('player data not found for the WebSocket connection');
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
                        }),
                    );
                    console.log(
                        `Client has been authorized. User's id: ${decoded.id}. Username: ${decoded.username}`
                    );
                })
                .catch((err) => {
                    console.log(err);
                    ws.send(
                        JSON.stringify({
                            event: 'unauthorized',
                        }),
                    );
                    ws.close();
                    console.log(
                        'Client tried to authenticate with invalid token. Closing socket.'
                    );
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

            if (!isPlayerTurn(player, room)) {
                return;
            }

            const cardIndex = room.gameState.deck.findIndex(
                (card: ICardProps) => card.id === message.cardId,
            );
            if (cardIndex >= 0) {
                room.gameState.deck[cardIndex].pos = {
                    x: message.x,
                    y: message.y,
                };
            }

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws,
            );

            players.forEach((socket: WebSocket) => {
                socket.send(JSON.stringify(message));
            });

            broadcastGameState(room);
        }

        if (message.event === 'create-room') {
            const player = getPlayerDataBySocket(ws);

            if (player === undefined) {
                console.log('Failed to create room. Player data undefined');
                ws.send(JSON.stringify({ event: 'room-create-fail' }));
                return;
            }

            if (!player.isOwner) {
                console.log("Failed to create room. Player isn't owner");
                ws.send(JSON.stringify({ event: 'room-create-fail' }));
                return;
            }

            const room: Room = {
                maxPlayers: player.maxPlayers!,
                players: [ws],
                playerIds: [player.id.toString()],
                settings: {
                    deckCount: 1,
                    cardsPerPlayer: 0,
                    jokerCount: 0,
                },
                isGameStarted: false,
                gameState: {
                    deck: initializeDeck(),
                    players: [],
                    currentPlayerId: '', // set when the game starts
                    gamePhase: GamePhase.WaitingForPlayers,
                },
            };

            setRoomByCode(player.roomCode, room);
            ws.send(JSON.stringify({ event: 'room-created' }));
            console.log(
                `Room created with code: ${player.roomCode}. Maxplayers: ${player.maxPlayers}`
            );
        }

        if (message.event === 'join-room') {
            const player = getPlayerDataBySocket(ws);

            if (player === undefined) {
                console.log('Failed to join room. Player data is undefined');
                ws.send(JSON.stringify({ event: 'join-room-fail' }));
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                console.log("Failed to join room. Room doesn't exist");
                ws.send(JSON.stringify({ event: 'join-room-fail' }));
                return;
            }

            if (room.players.length >= room.maxPlayers) {
                ws.send(
                    JSON.stringify({
                        event: 'room-full',
                    }),
                );
                console.log(
                    `User: ${player.username} failed to join room: ${player.roomCode}. Room is full: ${room.players.length}/${room.maxPlayers}`
                );
                return;
            }

            ws.send(
                JSON.stringify({
                    event: 'joined-room',
                    settings: room.settings,
                }),
            );

            console.log(
                `Player: ${player.username} joined room: ${player.roomCode}`
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
                    }),
                );
            });

            // send player-joined event to others that are in the room

            room.players.forEach((socket: WebSocket) => {
                socket.send(
                    JSON.stringify({
                        event: 'player-joined',
                        username: player.username,
                        id: player.id,
                    }),
                );
            });

            const newPlayerSockets = [...room.players, ws];
            room.players = newPlayerSockets;
            setRoomByCode(player.roomCode, room);

            if (room.isGameStarted) {
                ws.send(
                    JSON.stringify({
                        event: 'game-started',
                    }),
                );
                console.log(
                    'Game has already started in room: ' +
                        player.roomCode +
                        '. Sending game-started event to new player'
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
                (socket: WebSocket) => socket !== ws,
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
                console.log(
                    `User: ${player.username} isn't owner of room: ${player.roomCode} and can't change settings`
                );
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                return;
            }

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws,
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
                    }),
                );
            });
        }

        if (message.event === 'start-game') {
            const player = getPlayerDataBySocket(ws);

            if (player === undefined) {
                console.log(`Failed to start game. Player data undefined`);
                return;
            }

            const room = getRoomByCode(player.roomCode);
            if (room === undefined) {
                console.log(`Failed to start game. Room does not exist`);
                return;
            }

            room.isGameStarted = true;
            setRoomByCode(player.roomCode, room);

            const players = room.players.filter(
                (socket: WebSocket) => socket !== ws,
            );

            players.forEach((socket: WebSocket) => {
                socket.send(
                    JSON.stringify({
                        event: 'game-started',
                    }),
                );
            });

            console.log(`Game started in room: ${player.roomCode}`);
        }

        if (message.event === 'kick-player') {
            const player = getPlayerDataBySocket(ws);
            if (player === undefined) {
                console.log(
                    `Failed to kick player. Player who initiated kick-player has no data`
                );
                return;
            }

            if (player.isOwner === false) {
                console.log(
                    `Failed to kick player. User: ${player.username} who initiated kick-player isn't owner`
                );
                return;
            }

            const socket = getSocketByPlayerId(message.playerId);
            if (socket === undefined) {
                return;
            }
            socket.send(JSON.stringify({ event: 'player-kicked' }));
            const kickedPlayer = getPlayerDataBySocket(socket);
            console.log(
                `Player: ${kickedPlayer!.username} kicked from room: ${
                    player.roomCode
                }`
            );
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
                (socket: WebSocket) => socket !== ws,
            );

            players.forEach((socket: WebSocket) => {
                socket.send(JSON.stringify(message));
            });
        }

        if (message.event === 'play-card' || message.event === 'pass-turn') {
            endTurn(player.roomCode);
        }
    });

    ws.onclose = () => {
        console.log('A client disconnected');
        removePlayer(ws);
    };

    ws.on('error', (error) => console.error('WebSocket error:', error));
});
