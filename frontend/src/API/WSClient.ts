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

type WSData = MoveCardData | FlipCardData;

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
        this.client.send(JSON.stringify(message));
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
}

export default WSClient;
