import { ECardState } from '../../src/components/GameArea/Card/Card';

declare interface IPayload {
    playerId: string;
    data: unknown;
}

declare interface IData {
    event: 'move-card' | 'flip-card';
    payload: IPayload;
}

declare interface IMoveCard extends IData {
    event: 'move-card';
    payload: {
        playerId: string;
        data: {
            cardId: number;
            state: ECardState;
            x: number;
            y: number;
        };
    };
}
