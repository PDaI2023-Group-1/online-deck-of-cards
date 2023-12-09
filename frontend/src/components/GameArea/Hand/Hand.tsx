import { Component, For } from 'solid-js';
import { ICardProps } from '../Card/Card';

import './Hand.css';

const Hand: Component<Array<ICardProps>> = (props) => {
    return (
        <div id="own-hand" draggable={false} class="gap-2">
            <For each={props}>
                {(card) => {
                    return (
                        <div
                            class="own-card"
                            id={`${card.id}`}
                            draggable={false}
                        >
                            {card.isFaceUp ? (
                                <>
                                    {card.value}
                                    &nbsp;
                                    {card.suit}
                                </>
                            ) : (
                                <>card</>
                            )}
                            &nbsp;
                        </div>
                    );
                }}
            </For>
        </div>
    );
};

export default Hand;
