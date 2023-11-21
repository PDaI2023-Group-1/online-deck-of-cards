import { Component, For } from 'solid-js';
import { ICardProps } from '../Card/Card';

import './Hand.css';

const Hand: Component<Array<ICardProps>> = (props) => {
    return (
        <div id="own-hand">
            <For each={props}>
                {(card) => {
                    return (
                        <div class="own-card" id={`${card.id}`}>
                            {card.value}
                            &nbsp;
                            {card.suit}
                            &nbsp;
                        </div>
                    );
                }}
            </For>
        </div>
    );
};

export default Hand;
