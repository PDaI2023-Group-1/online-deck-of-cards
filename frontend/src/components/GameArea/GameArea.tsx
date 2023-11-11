import { Component, For, createSignal } from 'solid-js';
import Card, { ICardProps, ECardState, ECardSuit } from './Card/Card';
import './GameAreaStyles.css';

const defaultCardProps: ICardProps = {
    id: 0,
    pos: { x: 250, y: 150 },
    isFaceUp: false,
    order: 0,
    cardState: ECardState.inDeck,
    playerId: '',
    value: 0,
    suit: ECardSuit.ace,
};

const GameArea: Component = () => {
    const [cardsArr, setCardsArr] = createSignal<Array<ICardProps>>([]);
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
                        id: value + suit * 13,
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

    const setActiveCard = (target: HTMLDivElement) => {
        setActiveCardId(+target.id);
    };

    const handleDragEnd = (event: DragEvent) => {
        const pos = { x: event.x, y: event.y };
        const index = activeCardId();

        console.log('Currently active card', activeCardId());

        if (typeof index !== 'number') return;

        const newCard = { ...cardsArr()[index], pos };

        setCardsArr(cardsArr().map((e, i) => (i === index ? newCard : e)));
        setActiveCardId(undefined);
    };

    return (
        <div id="ga-container">
            <div class="ga-info-panel">
                <button onClick={() => addDeck()}>Add deck</button>
                <button onClick={() => resetDeck()}>Reset deck</button>
            </div>
            <div
                id="ga-main-play-area"
                // onMouseMove={(event) => handleMouseMove(event)}
            >
                <For each={cardsArr()}>
                    {(card, i) => (
                        <div
                            id={`${i()}`}
                            draggable={true}
                            onDragStart={(event) =>
                                setActiveCard(event.currentTarget)
                            }
                            // onDrag={(event) => handleDrag(event)}
                            onDragEnd={(event) => handleDragEnd(event)}
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
