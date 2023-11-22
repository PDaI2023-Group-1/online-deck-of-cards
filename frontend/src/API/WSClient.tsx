import { ECardState } from '../components/GameArea/Card/Card';

type ICardPosition = {
    cardId: string;
    state: ECardState;
    x: number;
    y: number;
};

type MessageCallback = (message: MessageEvent) => void;

class WSClient {
    private client: WebSocket;
    public id: string;

    constructor(id: string) {
        this.client = new WebSocket('ws://localhost:8080');
        this.id = id;
    }

    onMessage(cb: MessageCallback) {
        this.client.onmessage = (message) => cb(message);
    }

    moveCard(cardPos: ICardPosition) {
        this.client.send(
            JSON.stringify({ type: 'move-card', payload: cardPos }),
        );
    }

    flipCard(cardId: string) {
        this.client.send(
            JSON.stringify({ type: 'flip-card', payload: cardId }),
        );
    }
}

export default WSClient;
