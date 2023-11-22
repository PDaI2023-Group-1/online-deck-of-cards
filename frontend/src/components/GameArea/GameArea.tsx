import { Component, For, createSignal, onMount } from 'solid-js';
import Card, { ICardProps, ECardState, ECardSuit } from './Card/Card';
import Hand from './Hand/Hand';
import './GameAreaStyles.css';
import WSClient from '../../API/WSClient';

import { addDeck, generateDeckArray, shuffleDeck } from './ga-utils';
import { IMoveCard } from '../../../types/custom';

export interface IPlayer {
    id: string;
    pos: string;
    cards: Array<ICardProps>;
}

const defaultCardProps: ICardProps = {
    id: 0,
    pos: { x: 250, y: 150 },
    isFaceUp: true,
    order: 0,
    cardState: ECardState.onTable,
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
    const [deck, setDeck] = createSignal<Array<ICardProps>>([]);
    const [activeCardId, setActiveCardId] = createSignal<number>();
    const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });
    const [players, setPlayers] = createSignal<Array<IPlayer>>([playerProps]);

    const wsClient = new WSClient('local');

    // eslint-disable-next-line solid/reactivity
    wsClient.onMessage((data) => {
        console.log(data);
        if (data.event === 'move-card') {
            const newdata = data as IMoveCard;
            const index = deck().findIndex(
                (el) => el.id === newdata.payload.data.cardId,
            );
            if (typeof index !== 'number' || index === -1) return;
            const pos = {
                x: newdata.payload.data.x,
                y: newdata.payload.data.y,
            };

            const newCard = { ...deck()[index], pos };

            setDeck(deck().map((e, i) => (i === index ? newCard : e)));
        }
    });

    onMount(() => {
        setDeck(shuffleDeck(generateDeckArray(defaultCardProps)));
    });

    console.clear();

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
        if (typeof activeCardId() === 'undefined') return;

        wsClient.moveCard({
            cardId: activeCardId() || -4,
            state: deck()[index].cardState,
            x: pos.x,
            y: pos.y,
        });
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

        //cant be out here giving cards to strangers
        if (!target.classList.contains('local')) return;

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
    };

    const handleShuffle = () => {
        console.table(deck());

        const newDeck = shuffleDeck(deck());
        console.table(newDeck);
        setDeck(newDeck);
    };

    const handleHandCardClick = (event: MouseEvent, target: Element) => {
        if (Number.isNaN(+target.id)) return;
        const index = players()[0].cards.findIndex(
            (el) => el.id === +target.id,
        );

        const deckIndex = deck().findIndex((el) => el.id === +target.id);

        let newCards = players()[0].cards.slice(0, index);
        const newCards2 = players()[0].cards.slice(index + 1);

        newCards = newCards.concat(newCards2);
        const newPlayers = [
            { ...players()[0], cards: newCards },
            ...players().slice(1),
        ];

        const updatedCard: ICardProps = {
            ...deck()[deckIndex],
            cardState: ECardState.onTable,
            playerId: '',
        };
        setDeck(deck().map((e, i) => (i === deckIndex ? updatedCard : e)));
        setPlayers(newPlayers);
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
            {/* move player to its own component, this is quickly getting out of hand or maybe not, this is fine if we want to deal with a trainwreck but get this done quick*/}
            <For each={players()}>
                {(player) => {
                    return (
                        <div
                            draggable={false}
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
                            <div draggable={false}>
                                <p draggable={false}>
                                    Player id: {player.id}
                                    <br />
                                    Cards in hand:
                                </p>
                            </div>

                            <div
                                onClick={(event) =>
                                    handleHandCardClick(event, event.target)
                                }
                                draggable={false}
                            >
                                <Hand {...players()[0].cards} />
                            </div>
                        </div>
                    );
                }}
            </For>
        </>
    );
};

export default GameArea;
