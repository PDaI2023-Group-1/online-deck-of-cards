import { Component, For, createSignal } from 'solid-js';
import Card, { ICardProps, ECardState, ECardSuit } from './Card/Card';
import './GameAreaStyles.css';

import { addDeck, generateDeckArray, shuffleDeck } from './ga-utils';

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
    const [deck, setDeck] = createSignal(generateDeckArray(defaultCardProps));
    const [activeCardId, setActiveCardId] = createSignal<number>();
    const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });

    const handleMouseMove = (event: MouseEvent) => {
        const pos = { x: event.x, y: event.y };
        const index = activeCardId();

        if (typeof index !== 'number') return;

        const newCard = { ...deck()[index], pos };

        setDeck(deck().map((e, i) => (i === index ? newCard : e)));
    };

    const handleMouseDown = (event: MouseEvent, target: Element) => {
        if (!target) return;

        if (!target.id || target.id === '' || typeof +target.id !== 'number')
            return;

        setStartPos({ x: event.x, y: event.y });
        setActiveCardId(+target.id);
    };

    const handleMouseUp = (event: MouseEvent, target: Element) => {
        if (!target.classList.contains('card-container')) return;

        if (typeof activeCardId() === undefined || Number.isNaN(activeCardId()))
            return;

        const index = deck().findIndex((el) => el.id === activeCardId());

        if (typeof index !== 'number' && index < 0) return;

        const moved =
            startPos().x - event.x !== 0 && startPos().y - event.y !== 0;

        const pos = { x: event.x, y: event.y };

        const newCard: ICardProps = {
            ...deck()[index],
            pos: moved ? pos : deck()[index].pos,
            isFaceUp: moved ? deck()[index].isFaceUp : !deck()[index].isFaceUp,
        };

        setDeck(deck().map((e, i) => (i === index ? newCard : e)));
        setActiveCardId(undefined);
    };

    return (
        <div
            id="ga-container"
            onMouseMove={(event) => handleMouseMove(event)}
            onMouseDown={(event) => handleMouseDown(event, event.target)}
            onMouseUp={(event) => handleMouseUp(event, event.target)}
        >
            <div class="ga-info-panel">
                <button
                    onClick={() => setDeck(addDeck(deck(), defaultCardProps))}
                >
                    Add deck
                </button>
                <button onClick={() => setDeck([])}>Reset deck</button>
                <button onClick={() => setDeck(shuffleDeck(deck()))}>
                    Shuffle deck
                </button>
            </div>

            <For each={deck()}>
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
