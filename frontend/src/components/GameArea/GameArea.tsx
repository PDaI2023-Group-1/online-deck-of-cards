import { Component, createSignal } from 'solid-js';
import Card, { ICardProps, ECardState, ECardSuit } from './Card/Card';
import './GameAreaStyles.css';

const defaultCardProps: ICardProps = {
    pos: { x: 0, y: 0 },
    isFaceUp: false,
    order: 0,
    cardState: ECardState.inDeck,
    playerId: '',
    value: 0,
    suit: ECardSuit.ace,
};

const GameArea: Component = () => {
    const [cardsArr, setCardsArr] = createSignal<Array<ICardProps>>([]);
    const [defaultCard, setDefaultCard] = createSignal(defaultCardProps);

    const addDeck = () => {
        console.clear();
        for (let suit = 0; suit < 4; suit++) {
            for (let value = 0; value < 13; value++) {
                setCardsArr((prev) => [
                    ...prev,
                    { ...defaultCardProps, value: value + 1, suit: suit },
                ]);
            }
        }
        console.table(cardsArr());
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
        setDefaultCard({
            ...defaultCardProps,
            pos: { x: event.x, y: event.y },
        });
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
                <Card {...defaultCard()} />
            </div>
        </div>
    );
};

export default GameArea;
