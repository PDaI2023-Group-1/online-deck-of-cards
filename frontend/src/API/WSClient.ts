import { IData } from '../../types/custom';
import { ECardState } from '../components/GameArea/Card/Card';

type ICardPosition = {
    cardId: number;
    state: ECardState;
    x: number;
    y: number;
};

type MessageCallback = (data: IData) => void;

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
        this.client.send(
            JSON.stringify({
                event: 'move-card',
                payload: { playerId: this.playerId, data: cardPos },
            }),
        );
    }

    flipCard(cardId: string) {
        if (!this.serverIsReady) return;
        this.client.send(
            JSON.stringify({
                event: 'flip-card',
                payload: { cardId: cardId, data: this.playerId },
            }),
        );
    }
}

export default WSClient;
