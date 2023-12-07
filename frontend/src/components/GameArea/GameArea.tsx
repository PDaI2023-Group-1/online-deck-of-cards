import { Component, For, Show, createSignal, onMount } from 'solid-js';
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
    pos: { x: window.screen.width / 2, y: window.screen.height / 2 - 80 },
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

            const pIdx = players().findIndex((p) => p.id === data.playerId);

            const pos = {
                x: data.x,
                y: data.y,
            };

            if (players().length === 2) {
                if (pIdx === 1) {
                    pos.x = window.screen.width - data.x;
                    pos.y = window.screen.height - data.y - 160;
                }
            }

            if (players().length === 3) {
                if (pIdx === 1) {
                    pos.x = window.screen.width / 1.35 - data.y;
                    pos.y = data.x - window.screen.height / 2.15;
                }

                if (pIdx === 2) {
                    pos.x = window.screen.width / 3.9 + data.y;
                    pos.y = data.x - window.screen.height / 2.15;
                }
            }

            const { newDeck } = deckState.updateCardPos(data.cardId, pos);

            setDeck(newDeck);
        }

        if (data.event === 'flip-card') {
            if (data.playerId === players()[0].id) return;
            const { newDeck } = deckState.flipCard(data.cardId);
            setDeck(newDeck);
        }

        if (data.event === 'hide-card') {
            const { newDeck, newCard } = deckState.toggleCardVisibility(
                data.cardId,
                data.playerId,
            );

            newCard.isFaceUp = false;

            const pIdx = players().findIndex((p) => p.id === data.playerId);

            const updatedPlayer: IPlayer = {
                ...players()[pIdx],
                cards: [...players()[pIdx].cards, newCard],
            };

            console.log(updatedPlayer);

            setPlayers(
                players().map((player, i) => {
                    if (i === pIdx) return updatedPlayer;
                    return player;
                }),
            );
            setDeck(newDeck);
        }

        if (data.event === 'show-card') {
            const { newDeck, newCard } = deckState.toggleCardVisibility(
                data.cardId,
                data.playerId,
            );
            const pIdx = players().findIndex((p) => p.id === data.playerId);
            setDeck(newDeck);

            const updatedPlayer: IPlayer = {
                ...players()[pIdx],
                cards: players()[pIdx].cards.filter(
                    (card) => card.id !== data.cardId,
                ),
            };

            setPlayers(
                players().map((player, i) => {
                    if (i === pIdx) return updatedPlayer;
                    return player;
                }),
            );
        }

        if (data.event === 'player-joined') {
            const p: IPlayer = {
                username: data.username,
                id: data.id.toString(),
                pos: 'right',
                cards: [],
            };
            const newPlayers = [...players(), p];
            setPlayers(newPlayers);
        }

        if (data.event === 'player-left') {
            const newPlayers = players().filter(
                (player) => player.id !== data.id.toString(),
            );
            setPlayers(newPlayers);
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
            isFaceUp: true,
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
        deckState.setDeck(deck());
        setActiveCardId(undefined);
    };

    const handleHandCardClick = (event: MouseEvent, target: Element) => {
        if (Number.isNaN(+target.id)) return;
        const index = players()[0].cards.findIndex(
            (el) => el.id === +target.id,
        );
        // cant be here clicking other people cards and seeing them
        if (index === -1) return;

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
            isFaceUp: false,
        };
        setDeck(deck().map((e, i) => (i === deckIndex ? updatedCard : e)));
        deckState.setDeck(deck());
        setPlayers(newPlayers);
    };

    const PlayerHand = (player: IPlayer) => {
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
                    'z-index': `${1000}`,
                    position: 'relative',
                }}
            >
                <div draggable={false}>
                    <p draggable={false}>
                        Username: {player.username}
                        <br />
                        Player id: {player.id}
                        <br />
                        Cards in hand: {player.cards.length}
                    </p>
                </div>

                <div
                    onClick={(event) =>
                        handleHandCardClick(event, event.target)
                    }
                    draggable={false}
                >
                    <Hand {...player.cards} />
                </div>
            </div>
        );
    };

    return (
        <>
            <Show when={players().length === 2}>
                <div class="mb-6">
                    <PlayerHand {...players()[1]} />
                </div>
            </Show>
            <Show when={players().length === 4}>
                <div class="mb-6">
                    <PlayerHand {...players()[3]} />
                </div>
            </Show>
            <div class="flex justify-between items-center">
                <Show when={players().length === 3}>
                    <PlayerHand {...players()[1]} />
                </Show>
                <div
                    id="ga-container"
                    onMouseMove={(event) => handleMouseMove(event)}
                    onMouseDown={(event) =>
                        handleMouseDown(event, event.target)
                    }
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
                <Show when={players().length === 3}>
                    <PlayerHand {...players()[2]} />
                </Show>
            </div>

            {/* move player to its own component, this is quickly getting out of hand or maybe not, this is fine if we want to deal with a trainwreck but get this done quick*/}
            <div class="mt-6">
                <PlayerHand {...players()[0]} />
            </div>
        </>
    );
};

export default GameArea;
