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
    playerIds: string[];
};

type EndTurn = {
    event: 'end-turn';
};

type PlayCardData = {
    event: 'play-card';
    playerId: string;
    cardId: number;
};

type PassTurnData = {
    event: 'pass-turn';
    playerId: string;
};

type GameState = {
    deck: Array<ICardProps>; // Include card positions, face-up/down status, etc.
    players: Array<PlayerState>; // Information about each player
    currentPlayerId: string; // ID of the player whose turn it is
    gamePhase: GamePhase; // Current phase of the game, e.g., "waiting", "playing", "ended"
    // ... other relevant game state information
};

type PlayerState = {
    id: string;
    hand: Array<ICardProps>; // Cards in the player's hand
    score: number; // Player's score
    // ... other relevant player information
};

enum GamePhase {
    WaitingForPlayers,
    InProgress,
    Completed,
    // ... other phases as needed
}

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

export enum ECardState {
    onTable,
    inDeck,
    inHand,
    discarded,
}

export enum ECardSuit {
    diamond,
    heart,
    ace,
    spade,
}

export enum GamePhase {
    WaitingForPlayers = 'WaitingForPlayers',
    InProgress = 'InProgress',
    Completed = 'Completed',
    // ... other possible game phases
}

export type ICardProps = {
    id: number;
    pos: { x: number; y: number };
    isFaceUp: boolean;
    order: number;
    cardState: ECardState;
    playerId: string;
    value: number;
    suit: ECardSuit;
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
    | KickPlayer
    | EndTurn
    | PlayCardData
    | PassTurnData;
