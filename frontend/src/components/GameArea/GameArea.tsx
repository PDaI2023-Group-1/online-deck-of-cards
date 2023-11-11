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
    const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });

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

    const handleMouseMove = (event: MouseEvent) => {
        const pos = { x: event.x, y: event.y };
        const index = activeCardId();

        if (typeof index !== 'number') return;

        const newCard = { ...cardsArr()[index], pos };

        setCardsArr(cardsArr().map((e, i) => (i === index ? newCard : e)));
    };

    const handleMouseDown = (event: MouseEvent, target: Element) => {
        if (!target) return;

        if (!target.id || target.id === '' || typeof +target.id !== 'number')
            return;

        setStartPos({ x: event.x, y: event.y });
        setActiveCardId(+target.id);
        console.log(startPos());
    };

    const handleMouseUp = (event: MouseEvent) => {
        const index = activeCardId();

        if (typeof index !== 'number') return;

        const moved =
            startPos().x - event.x !== 0 && startPos().y - event.y !== 0;
        console.log(moved);
        const pos = { x: event.x, y: event.y };

        const newCard: ICardProps = {
            ...cardsArr()[index],
            pos: moved ? pos : cardsArr()[index].pos,
            isFaceUp: moved
                ? cardsArr()[index].isFaceUp
                : !cardsArr()[index].isFaceUp,
        };

        setCardsArr(cardsArr().map((e, i) => (i === index ? newCard : e)));
        setActiveCardId(undefined);
    };

    return (
        <div
            id="ga-container"
            onMouseMove={(event) => handleMouseMove(event)}
            onMouseDown={(event) => handleMouseDown(event, event.target)}
            onMouseUp={(event) => handleMouseUp(event)}
        >
            <div class="ga-info-panel">
                <button onClick={() => addDeck()}>Add deck</button>
                <button onClick={() => resetDeck()}>Reset deck</button>
            </div>

            <For each={cardsArr()}>
                {(card, i) => (
                    <span id={`${i()}`} draggable={false}>
                        <Card {...card} />
                    </span>
                )}
            </For>
        </div>
    );
};

export default GameArea;
