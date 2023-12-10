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

import { getRoomByCode, setRoomByCode } from './utils/room';

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
        return;
    }

    const room = getRoomByCode(player.roomCode);
    if (room === undefined) {
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

    removePlayerIdBySocket(ws);
    removePlayerData(player.id);
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
                })
                .catch((err) => {
                    console.log(err);
                    ws.send(
                        JSON.stringify({
                            event: 'unauthorized',
                        }),
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
                    }),
                );
                return;
            }

            ws.send(
                JSON.stringify({
                    event: 'joined-room',
                    settings: room.settings,
                }),
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
                (socket: WebSocket) => socket !== ws,
            );

            players.forEach((socket: WebSocket) => {
                socket.send(
                    JSON.stringify({
                        event: 'game-started',
                    }),
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
