import { Component, For, createSignal } from 'solid-js';
import Card, { ICardProps, ECardState, ECardSuit } from './Card/Card';
import './GameAreaStyles.css';

const defaultCardProps: ICardProps = {
    id: 0,
    pos: { x: 140, y: 150 },
    isFaceUp: false,
    order: 0,
    cardState: ECardState.inDeck,
    playerId: '',
    value: 0,
    suit: ECardSuit.ace,
};

const GameArea: Component = () => {
    const [cardsArr, setCardsArr] = createSignal<Array<ICardProps>>([]);
    const [pointerPos, setPointerPos] = createSignal({ x: 0, y: 0 });
    const [activeCardId, setActiveCardId] = createSignal<number>();

    const addDeck = () => {
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                setCardsArr((prev) => [
                    ...prev,
                    {
                        ...defaultCardProps,
                        value: value + 1,
                        suit: suit,
                        id: +`${suit}${value}`, // I realize this only works for one deck, adding support for more later
                    },
                ]);
            }
        }
    };

    const resetDeck = () => {
        console.clear();
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                setCardsArr([]);
            }
        }
    };

    const handleMouseMove = (event: MouseEvent) => {
        setPointerPos({ x: event.x, y: event.y });

        if (!activeCardId()) return;

        const activeElement = cardsArr().find((el) => el.id === activeCardId());
        console.log(activeElement);
        console.log(activeCardId());
    };

    const setActiveCard = (event: MouseEvent) => {
        if (!event.target) return;

        // eslint-disable-next-line
        // @ts-ignore
        const el: HTMLElement = event.target;
        setActiveCardId(+el.id);
    };

    return (
        <div id="ga-container">
            <div class="ga-info-panel">
                <button onClick={() => addDeck()}>Add deck</button>
                <button onClick={() => resetDeck()}>Reset deck</button>
            </div>
            <div
                id="ga-main-play-area"
                onMouseMove={(event) => handleMouseMove(event)}
            >
                <For each={cardsArr()}>
                    {(card) => (
                        <div
                            onMouseDown={(event) => setActiveCard(event)}
                            onMouseMove={(event) => handleMouseMove(event)}
                            onMouseUp={setActiveCardId(undefined)}
                        >
                            <Card {...card} />
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
};

export default GameArea;
