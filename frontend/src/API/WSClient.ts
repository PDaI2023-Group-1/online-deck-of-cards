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
    playerId: number;
};

type JoinRoom = {
    event: 'join-room';
    token: string;
    playerId: number;
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

type WSData =
    | MoveCardData
    | FlipCardData
    | PlayerChanged
    | JoinRoom
    | Authorized
    | RoomDataChanged
    | JoinedRoom;

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
        if (!this.serverIsReady()) return;
        this.client!.send(
            JSON.stringify({
                event: 'move-card',
                playerId: this.playerId,
                data: cardPos,
            }),
        );
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
}

export default WSClient;
