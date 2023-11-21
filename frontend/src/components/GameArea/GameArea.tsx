import { Component, For, createSignal } from 'solid-js';
import Card, { ICardProps, ECardState, ECardSuit } from './Card/Card';
import './GameAreaStyles.css';

import { addDeck, generateDeckArray, shuffleDeck } from './ga-utils';

interface IPlayer {
    id: string;
    pos: string;
    cards: Array<ICardProps>;
}

const defaultCardProps: ICardProps = {
    id: 0,
    pos: { x: 250, y: 150 },
    isFaceUp: true,
    order: 0,
    cardState: ECardState.inDeck,
    playerId: '',
    value: 0,
    suit: ECardSuit.ace,
};

const playerProps: IPlayer = {
    id: 'local',
    pos: 'right',
    cards: [],
};

const GameArea: Component = () => {
    const [deck, setDeck] = createSignal(generateDeckArray(defaultCardProps));
    const [activeCardId, setActiveCardId] = createSignal<number>();
    const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });
    const [players, setPlayers] = createSignal<Array<IPlayer>>([playerProps]);

    const handleMouseDown = (event: MouseEvent, target: Element) => {
        if (!target.classList.contains('card-container')) return;
        setStartPos({ x: event.x, y: event.y });
        setActiveCardId(+target.id);
    };

    const handleMouseMove = (event: MouseEvent) => {
        const pos = { x: event.x, y: event.y };
        const index = deck().findIndex((el) => el.id === activeCardId());
        if (typeof index !== 'number' || index === -1) return;

        const newCard = { ...deck()[index], pos };

        setDeck(deck().map((e, i) => (i === index ? newCard : e)));
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

    const handleGiveCardToPlayer = (event: MouseEvent, target: Element) => {
        if (
            !target.classList.contains('ga-player') ||
            activeCardId() === undefined
        )
            return;

        if (target.classList.contains('local')) {
            const index = deck().findIndex((el) => el.id === activeCardId());

            const updatedCard: ICardProps = {
                ...deck()[index],
                cardState: ECardState.inHand,
                playerId: players()[0].id,
            };

            const updatedPlayer: IPlayer = {
                ...players()[0],
                cards: [...players()[0].cards, updatedCard],
            };

            setPlayers(
                players().map((player, i) => {
                    if (i === 0) return updatedPlayer;
                    return player;
                }),
            );
            setDeck(deck().map((e, i) => (i === index ? updatedCard : e)));
            setActiveCardId(undefined);
        }
    };

    const handleShuffle = () => {
        console.table(deck());

        const newDeck = shuffleDeck(deck());
        console.table(newDeck);
        setDeck(newDeck);
    };

    return (
        <>
            <div class="ga-info-panel">
                <button
                    onClick={() => setDeck(addDeck(deck(), defaultCardProps))}
                >
                    Add deck
                </button>
                <button onClick={() => setDeck([])}>Reset deck</button>
                <button onClick={() => handleShuffle()}>Shuffle deck</button>
            </div>
            <div
                id="ga-container"
                onMouseMove={(event) => handleMouseMove(event)}
                onMouseDown={(event) => handleMouseDown(event, event.target)}
                onMouseUp={(event) => handleMouseUp(event, event.target)}
            >
                <For each={deck()}>
                    {(card, i) => {
                        const getProps = (
                            props: ICardProps,
                            index: number,
                        ): ICardProps => {
                            props.order = deck().length - index;
                            return props;
                        };

                        return (
                            <span id={`${i()}`} draggable={false}>
                                <Card {...getProps(card, i())} />
                            </span>
                        );
                    }}
                </For>
            </div>
            {/* move player to its own component, this is quickly getting out of hand */}
            <For each={players()}>
                {(player) => {
                    return (
                        <div
                            onMouseEnter={(event) =>
                                handleGiveCardToPlayer(event, event.target)
                            }
                            class={`ga-player ${player.id}`}
                            style={{
                                'background-color': 'blueviolet',
                                width: '275px',
                                height: '75px',
                                'margin-top': '15px',
                                'z-index': `${1000}`,
                                position: 'relative',
                            }}
                        >
                            Player id: {player.id}
                            Cards in hand:{' '}
                            <For each={player.cards}>
                                {(card) => (
                                    <p>
                                        suit: {card.suit} val: {card.value}
                                    </p>
                                )}
                            </For>
                        </div>
                    );
                }}
            </For>
        </>
    );
};

export default GameArea;
