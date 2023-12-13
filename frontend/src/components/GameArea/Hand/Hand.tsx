import { Component, For } from 'solid-js';

import './Hand.css';
import { IPlayer } from '../GameArea';

interface PlayerHand extends IPlayer {
    isOwnerOfCards: boolean;
}

const Hand: Component<PlayerHand> = (props) => {
    const getCardImageSource = (value: number, suit: number) => {
        return `/assets/${value}_of_${suit}.webp`;
    };

    return (
        <div id="own-hand" draggable={false} class="gap-2">
            <For each={props.cards}>
                {(card) => {
                    return (
                        <div
                            class={
                                props.isOwnerOfCards ? 'own-card' : 'card-back'
                            }
                            id={`${card.id}`}
                            draggable={false}
                            style={
                                props.isOwnerOfCards
                                    ? {
                                          'background-image': `url(${getCardImageSource(
                                              card.value,
                                              card.suit,
                                          )})`,
                                          'background-size': 'cover',
                                      }
                                    : ''
                            }
                        />
                    );
                }}
            </For>
        </div>
    );
};

export default Hand;
