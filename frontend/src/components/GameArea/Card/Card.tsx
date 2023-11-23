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
    id: number;
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
            draggable={false}
            hidden={props.cardState === ECardState.inHand}
            class={
                props.isFaceUp
                    ? [
                          'card-container',
                          `card-suit-${props.suit}`,
                          `card-value-${props.value}`,
                      ].join(' ')
                    : 'card-container'
            }
            id={`${props.id}`}
            style={{
                left: `${props.pos.x - 20}px`,
                top: `${props.pos.y - 25}px`,
            }}
        >
            {props.isFaceUp ? <>{props.value}</> : <>card</>}
        </div>
    );
};

export default Card;
