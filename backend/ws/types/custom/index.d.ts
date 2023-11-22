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

declare interface BaseMessage {
    event: string;
    payload: {
        id: string;
        data: unknown;
    };
}

declare interface UpdateCardPosition extends BaseMessage {
    payload: {
        id: string;
        data: ICardPosition;
    };
}
