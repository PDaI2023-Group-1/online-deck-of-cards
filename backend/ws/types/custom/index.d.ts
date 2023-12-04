declare enum ECardState {
    onTable,
    inDeck,
    inHand,
    discarded,
}

declare type ICardPosition = {
    cardId: string;
    state: ECardState;
    x: number;
    y: number;
};

type MoveCardData = {
    event: 'move-card';
    playerId: string;
    cardId: number;
    state: ECardState;
    x: number;
    y: number;
};

type FlipCardData = {
    event: 'flip-card';
    playerId: string;
    cardId: number;
    isfaceUp: boolean;
};

type PlayerChanged = {
    event: 'player-joined' | 'player-left';
    username: string;
    playerId: number;
};

type JoinRoom = {
    event: 'join-room';
};

type CreateRoom = {
    event: 'create-room';
};

type Authorize = {
    event: 'authorize';
    token: string;
};

type Token = {
    id: number;
    username: string;
    roomCode: string;
    isOwner: boolean;
    maxPlayers?: number;
};

type Room = {
    maxPlayers: number;
    players: array<WebSocket>;
    isGameStarted: boolean;
    settings: {
        deckCount: number;
        cardsPerPlayer: number;
        jokerCount: number;
    };
    gameState: GameState;
};

type RoomDataChanged = {
    event: 'room-data-changed';
    valueType: 'deck-count' | 'cards-per-player' | 'joker-count';
    value: number;
};

type StartGame = {
    event: 'start-game';
};

type EndTurn = {
    event: 'end-turn';
};

type KickPlayer = {
    event: 'kick-player';
    playerId: number;
};

declare type WSData =
    | MoveCardData
    | FlipCardData
    | JoinRoom
    | CreateRoom
    | PlayerChanged
    | Authorize
    | RoomDataChanged
    | StartGame
    | KickPlayer;
