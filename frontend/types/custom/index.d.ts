import { ECardState } from '../../src/components/GameArea/Card/Card';

declare interface IPayload {
    playerId: string;
    data: unknown;
}

declare interface IData {
    event: 'move-card' | 'flip-card' | 'player-joined' | 'player-left';
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

declare interface PlayerChanged extends IData {
    event: 'player-joined' | 'player-left';
    data: {
        username: string;
    };
}
