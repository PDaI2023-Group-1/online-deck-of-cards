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

type Authorized = {
    event: 'authorized';
};

type WSData =
    | MoveCardData
    | FlipCardData
    | PlayerChanged
    | JoinRoom
    | Authorized;

type MessageCallback = (data: WSData) => void;

class WSClient {
    private client: WebSocket;
    public playerId: string;

    constructor(id: string) {
        this.client = new WebSocket('ws://localhost:8080');
        this.playerId = id;
        this.client.onerror = (err) => this.onError(err);
    }

    private onError(err: Event) {
        throw new Error(err.type);
    }

    private serverIsReady(): boolean {
        return this.client.readyState === WebSocket.OPEN;
    }

    onMessage(cb: MessageCallback) {
        this.client.onmessage = (message) => cb(JSON.parse(message.data));
    }

    onOpen(cb: () => void) {
        this.client.onopen = () => cb();
    }

    moveCard(cardPos: ICardPosition) {
        if (!this.serverIsReady()) return;
        if (!this.serverIsReady) return;
        this.client.send(
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

        this.client.send(JSON.stringify(message));
    }

    joinRoom() {
        if (!this.serverIsReady) return;
        this.client.send(
            JSON.stringify({
                event: 'join-room',
            }),
        );
    }

    createRoom() {
        if (!this.serverIsReady) return;
        this.client.send(
            JSON.stringify({
                event: 'create-room',
            }),
        );
    }

    authorize(token: string) {
        if (!this.serverIsReady) return;
        this.client.send(
            JSON.stringify({
                event: 'authorize',
                token: token,
            }),
        );
    }
}

export default WSClient;
