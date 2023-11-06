import { Component } from 'solid-js';
import './CardStyle.css';

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

export interface ICardProps {
    pos: { x: number; y: number };
    isFaceUp: boolean;
    order: number;
    cardState: ECardState;
    playerId: string;
    value: number;
    suit: ECardSuit;
}

/**
 * playerId refers to the player who last handled the card,
 * or if it is in someone's hand it indicates whose hand it is in */
const Card: Component<ICardProps> = (props) => {
    return (
        <div
            class={'card-container'}
            style={{ left: `${props.pos.x}px`, top: `${props.pos.y}px` }}
        >
            Card
        </div>
    );
};

export default Card;
