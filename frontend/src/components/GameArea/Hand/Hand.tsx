import { Component, For } from 'solid-js';
import { ICardProps } from '../Card/Card';

import './Hand.css';

const Hand: Component<Array<ICardProps>> = (props) => {
    const getCardImageSource = (value: number, suit: number) => {
        return `/assets/${value}_of_${suit}.webp`;
    };

    return (
        <div id="own-hand" draggable={false} class="gap-2">
            <For each={props}>
                {(card) => {
                    return (
                        <div
                            class="own-card"
                            id={`${card.id}`}
                            draggable={false}
                            style={{
                                'background-image': `url(${getCardImageSource(
                                    card.value,
                                    card.suit,
                                )})`,
                                'background-size': 'cover',
                            }}
                        />
                    );
                }}
            </For>
        </div>
    );
};

export default Hand;
