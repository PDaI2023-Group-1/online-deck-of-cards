import { ECardState } from '../components/GameArea/Card/Card';

type ICardPosition = {
    cardId: number | undefined;
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
    id: number;
};

type JoinRoom = {
    event: 'join-room';
    token: string;
    id: number;
};

type JoinedRoom = {
    event: 'joined-room';
    settings: {
        deckCount: number;
        cardsPerPlayer: number;
        jokerCount: number;
    };
};

type Authorized = {
    event: 'authorized';
};

type RoomDataChanged = {
    event: 'room-data-changed';
    valueType: 'deck-count' | 'cards-per-player' | 'joker-count';
    value: number;
};

type StartGame = {
    event: 'game-started';
};

type RoomFull = {
    event: 'room-full';
};

type PlayerKicked = {
    event: 'player-kicked';
};

type RoomCreateFail = {
    event: 'room-create-fail';
};

type JoinRoomFail = {
    event: 'join-room-fail';
};

type CardEvent = {
    event: 'hide-card' | 'show-card';
    cardId: number;
    playerId: string;
};

type RoomClosed = {
    event: 'room-closed';
};

type WSData =
    | MoveCardData
    | FlipCardData
    | PlayerChanged
    | JoinRoom
    | Authorized
    | RoomDataChanged
    | JoinedRoom
    | StartGame
    | RoomFull
    | PlayerKicked
    | RoomCreateFail
    | JoinRoomFail
    | CardEvent
    | RoomClosed;

type MessageCallback = (data: WSData) => void;

class WSClient {
    private client?: WebSocket;
    public playerId: string;

    constructor(id: string) {
        this.playerId = id;
    }

    private onError(err: Event) {
        throw new Error(err.type);
    }

    private serverIsReady(): boolean {
        if (!this.client) {
            return false;
        }
        return this.client.readyState === WebSocket.OPEN;
    }

    connect(hostname: string, port: number, isSecure: boolean = false) {
        this.client = new WebSocket(
            `${isSecure ? 'wss' : 'ws'}://${hostname}:${port}`,
        );
        this.client.onerror = (err) => this.onError(err);
    }

    onMessage(cb: MessageCallback) {
        if (!this.client) {
            return;
        }
        this.client.onmessage = (message) => cb(JSON.parse(message.data));
    }

    onOpen(cb: () => void) {
        if (!this.client) {
            return;
        }
        this.client.onopen = () => cb();
    }

    moveCard(cardPos: ICardPosition) {
        if (!this.serverIsReady) return;
        if (cardPos.cardId === undefined || cardPos.cardId < 0) return;
        const message: MoveCardData = {
            event: 'move-card',
            cardId: cardPos.cardId,
            playerId: this.playerId,
            state: cardPos.state,
            x: cardPos.x,
            y: cardPos.y,
        };
        this.client!.send(JSON.stringify(message));
    }

    flipCard(cardId: number | undefined, isfaceUp: boolean) {
        if (!this.serverIsReady) return;
        if (typeof cardId === 'undefined') return;
        if (cardId < 0) return;

        const message: FlipCardData = {
            cardId,
            event: 'flip-card',
            isfaceUp,
            playerId: this.playerId,
        };

        this.client!.send(JSON.stringify(message));
    }

    joinRoom() {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'join-room',
            }),
        );
    }

    createRoom() {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'create-room',
            }),
        );
    }

    authorize(token: string) {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'authorize',
                token: token,
            }),
        );
    }

    changeRoomData(
        valueType: 'deck-count' | 'cards-per-player' | 'joker-count',
        value: number,
    ) {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'room-data-changed',
                valueType: valueType,
                value: value,
            }),
        );
    }

    startGame() {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'start-game',
            }),
        );
    }

    kickPlayer(playerId: number) {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'kick-player',
                playerId: playerId,
            }),
        );
    }

    hideCard(cardId: number) {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'hide-card',
                cardId: cardId,
                playerId: this.playerId,
            }),
        );
    }

    showCard(cardId: number) {
        if (!this.serverIsReady) return;
        this.client!.send(
            JSON.stringify({
                event: 'show-card',
                cardId: cardId,
                playerId: this.playerId,
            }),
        );
    }
}

export default WSClient;
