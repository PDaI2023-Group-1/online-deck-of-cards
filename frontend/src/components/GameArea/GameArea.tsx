import { Component, For, createEffect, createSignal, onMount } from 'solid-js';
import Card, { ICardProps, ECardState, ECardSuit } from './Card/Card';
import Hand from './Hand/Hand';
import './GameAreaStyles.css';
import WSClient from '../../API/WSClient';
import DeckStateManager from './DeckStateManager';

export interface IPlayer {
    id: string;
    pos: string;
    cards: Array<ICardProps>;
    username: string;
}

const defaultCardProps: ICardProps = {
    id: 0,
    pos: { x: 250, y: 150 },
    isFaceUp: false,
    order: 0,
    cardState: ECardState.onTable,
    playerId: '',
    value: 0,
    suit: ECardSuit.ace,
};

type Settings = {
    deckCount: number;
    jokerCount: number;
    cardsPerPlayer: number;
};

type GameAreaProps = {
    wsClient: WSClient;
    settings: Settings;
    players: Array<IPlayer>;
};

const GameArea: Component<GameAreaProps> = (props) => {
    const [deck, setDeck] = createSignal<Array<ICardProps>>([]);
    const [activeCardId, setActiveCardId] = createSignal<number>();
    const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });
    // eslint-disable-next-line solid/reactivity
    const [players, setPlayers] = createSignal<Array<IPlayer>>(props.players);

    // these need to be changed to be valid values coming from props instead
    // of just some stuff I was setting for dev testing purposes
    const deckState = new DeckStateManager(1, defaultCardProps);
    // eslint-disable-next-line solid/reactivity
    const wsClient = props.wsClient as WSClient;

    onMount(() => {
        console.clear(); //nice to get rid of unneccesary/old logs
        setDeck(deckState.getDeck());
        console.log(props.settings);
    });

    /* disabling because player 0 represents local player and thus will always exist
     * players[0] should be immediately set on page load, and after ws server tells
     * who the rest of the players are they should be appended to 1-xxx */
    // eslint-disable-next-line solid/reactivity
    wsClient.onMessage((data) => {
        if (data.event === 'move-card') {
            if (data.playerId === players()[0].id) return;
            const pos = {
                x: data.x,
                y: data.y,
            };
            const { newDeck } = deckState.updateCardPos(data.cardId, pos);

            setDeck(newDeck);
        }

        if (data.event === 'flip-card') {
            if (data.playerId === players()[0].id) return;
            const { newDeck } = deckState.flipCard(data.cardId);
            setDeck(newDeck);
        }

        if (data.event === 'hide-card') {
            const { newDeck } = deckState.toggleCardVisibility(
                data.cardId,
                data.playerId,
            );
            setDeck(newDeck);
        }

        if (data.event === 'show-card') {
            const { newDeck } = deckState.toggleCardVisibility(
                data.cardId,
                data.playerId,
            );
            setDeck(newDeck);
        }
    });

    const handleMouseDown = (event: MouseEvent, target: Element) => {
        if (!target.classList.contains('card-container')) return;
        setStartPos({ x: event.x, y: event.y });
        setActiveCardId(+target.id);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (typeof activeCardId() === 'undefined') return;
        const pos = { x: event.x, y: event.y };

        const { newDeck, index } = deckState.updateCardPos(activeCardId(), pos);
        setDeck(newDeck);

        wsClient.moveCard({
            cardId: activeCardId(),
            state: deck()[index].cardState,
            x: pos.x,
            y: pos.y,
        });
    };

    const handleMouseUp = (event: MouseEvent, target: Element) => {
        if (!target.classList.contains('card-container')) return;

        const currentPos = { x: event.x, y: event.y };
        const moved = JSON.stringify(startPos()) !== JSON.stringify(currentPos);
        if (!moved) {
            const { newDeck, isFaceUp } = deckState.flipCard(activeCardId());

            if (typeof isFaceUp === 'undefined') return;
            setDeck(newDeck);
            wsClient.flipCard(activeCardId(), isFaceUp);
        }

        setActiveCardId(undefined);
    };

    const handleGiveCardToPlayer = (event: MouseEvent, target: Element) => {
        if (
            !target.classList.contains('ga-player') ||
            activeCardId() === undefined
        )
            return;

        //cant be out here giving cards to strangers
        if (!target.classList.contains(players()[0].id)) return;

        const index = deck().findIndex((el) => el.id === activeCardId());
        wsClient.hideCard(activeCardId()!);

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

    const handleHandCardClick = (event: MouseEvent, target: Element) => {
        if (Number.isNaN(+target.id)) return;
        const index = players()[0].cards.findIndex(
            (el) => el.id === +target.id,
        );

        const deckIndex = deck().findIndex((el) => el.id === +target.id);
        wsClient.showCard(+target.id);

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
            {
                <div
                    draggable={false}
                    onMouseEnter={(event) =>
                        handleGiveCardToPlayer(event, event.target)
                    }
                    class={`ga-player ${players()[0].id}`}
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
                            Username: {players()[0].username}
                            <br />
                            Player id: {players()[0].id}
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
            }
        </>
    );
};

export default GameArea;
