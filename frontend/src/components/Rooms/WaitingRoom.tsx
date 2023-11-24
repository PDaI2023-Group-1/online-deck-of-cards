import { Component, createSignal, For, createEffect, onMount } from 'solid-js';
import axios from 'axios';
import { writeClipboard } from '@solid-primitives/clipboard';
import WSClient from '../../API/WSClient';
import { jwtDecode } from 'jwt-decode';
import GameArea, { IPlayer } from '../GameArea/GameArea';
import { useNavigate } from '@solidjs/router';

type RoomInfo = {
    roomInfo: {
        maxPlayers: number;
        pinCode: string | null;
        players: number[];
        ownerId: number;
        roomCode: string;
    };
};

type Token = {
    id: number;
    username: string;
    roomCode?: string;
    isOwner?: boolean;
};

const WaitingRoom: Component = () => {
    const [players, setPlayers] = createSignal<IPlayer[]>([]);
    const [currentPlayerCount, setCurrentPlayerCount] = createSignal(0);
    const [maxPlayerCount, setMaxPlayerCount] = createSignal(4);
    const [roomCode, setRoomCode] = createSignal('');
    const [deckCount, setDeckCount] = createSignal(1);
    const [cardsPerPlayer, setCardsPerPlayer] = createSignal(0);
    const [jokerCount, setJokerCount] = createSignal(0);
    const [isOwner, setIsOwner] = createSignal(false);
    const [gameHasStarted, setGameHasStarted] = createSignal(false);

    const navigate = useNavigate();

    let wsClient: WSClient;

    onMount(async () => {
        const token = localStorage.getItem('token');
        if (token === null) {
            return;
        }
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            const { data } = await axios.get<RoomInfo>(
                'http://127.0.0.1:8080/room/info',
                config,
            );

            if (data.roomInfo === null) {
                navigate('/room/create');
                return;
            }

            const decodedToken = jwtDecode<Token>(token);

            const p: IPlayer = {
                username: decodedToken.username,
                id: decodedToken.id.toString(),
                pos: 'right',
                cards: [],
            };

            setPlayers([p]);
            setCurrentPlayerCount(players().length);
            setMaxPlayerCount(data.roomInfo.maxPlayers);
            setRoomCode(data.roomInfo.roomCode);
            setIsOwner(decodedToken.isOwner!);

            wsClient = new WSClient(decodedToken.id.toString());

            wsClient.connect('localhost', 8080);
            wsClient.onOpen(() => {
                wsClient.authorize(token);
            });

            // eslint-disable-next-line solid/reactivity
            wsClient.onMessage((data) => {
                console.log(data);

                if (data.event === 'authorized') {
                    if (!decodedToken.isOwner) {
                        wsClient.joinRoom();
                    } else {
                        wsClient.createRoom();
                    }
                }

                if (data.event === 'joined-room') {
                    setDeckCount(data.settings.deckCount);
                    setJokerCount(data.settings.jokerCount);
                    setCardsPerPlayer(data.settings.cardsPerPlayer);
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
                    setCurrentPlayerCount(newPlayers.length);
                }

                if (data.event === 'player-left') {
                    const newUsernames = players().filter(
                        (player) => player.id !== data.id.toString(),
                    );
                    setPlayers(newUsernames);
                    setCurrentPlayerCount(newUsernames.length);
                }

                if (data.event === 'room-data-changed') {
                    if (data.valueType === 'deck-count') {
                        setDeckCount(data.value);
                    }
                    if (data.valueType === 'cards-per-player') {
                        setCardsPerPlayer(data.value);
                    }
                    if (data.valueType === 'joker-count') {
                        setJokerCount(data.value);
                    }
                }

                if (data.event === 'game-started') {
                    setGameHasStarted(true);
                }
            });
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                if (error.response!.status === 401) {
                    navigate('/room/create');
                }
            }
        }
    });

    createEffect(() => {
        setJokerCount(Math.min(deckCount() * 4, jokerCount()));
        setCardsPerPlayer(
            Math.floor(
                Math.min(
                    cardsPerPlayer(),
                    (deckCount() * 52 + jokerCount()) / maxPlayerCount(),
                ),
            ),
        );
    });

    const PlayerList = () => {
        return (
            <For each={players()}>
                {(player) => {
                    return <li>{player.username}</li>;
                }}
            </For>
        );
    };

    const startGame = () => {
        if (roomCode() !== '') {
            wsClient.startGame();
            setGameHasStarted(true);
        }
    };

    const handleDeckCount = (val: number) => {
        setDeckCount(val);
        wsClient.changeRoomData('deck-count', val);
    };
    const handleCardsPerPlayer = (val: number) => {
        setCardsPerPlayer(val);
        wsClient.changeRoomData('cards-per-player', val);
    };
    const handleJokerCount = (val: number) => {
        setJokerCount(val);
        wsClient.changeRoomData('joker-count', val);
    };

    return (
        <>
            {gameHasStarted() ? (
                <GameArea
                    wsClient={wsClient!}
                    settings={{
                        deckCount: deckCount(),
                        jokerCount: jokerCount(),
                        cardsPerPlayer: cardsPerPlayer(),
                    }}
                    players={players()}
                />
            ) : (
                <div class="flex flex-col justify-center items-center h-screen">
                    <div class="flex">
                        <form>
                            <label class="block text-gray-700 text-sm font-bold mb-2">
                                How many decks: {deckCount()}
                            </label>
                            <input
                                type="range"
                                class={`${
                                    isOwner()
                                        ? 'cursor-pointer'
                                        : 'disabled:opacity-75 cursor-not-allowed'
                                }`}
                                min="1"
                                max="2"
                                value={deckCount()}
                                onInput={(e) =>
                                    handleDeckCount(
                                        parseInt(e.currentTarget.value),
                                    )
                                }
                                disabled={!isOwner()}
                            />
                            <label class="block text-gray-700 text-sm font-bold mb-2">
                                How many cards are dealt to players:{' '}
                                {cardsPerPlayer()}
                            </label>
                            <input
                                type="range"
                                class={`${
                                    isOwner()
                                        ? 'cursor-pointer'
                                        : 'disabled:opacity-75 cursor-not-allowed'
                                }`}
                                min="0"
                                max={
                                    (deckCount() * 52 + jokerCount()) /
                                    maxPlayerCount()
                                }
                                value={cardsPerPlayer()}
                                onInput={(e) =>
                                    handleCardsPerPlayer(
                                        parseInt(e.currentTarget.value),
                                    )
                                }
                                disabled={!isOwner()}
                            />
                            <label class="block text-gray-700 text-sm font-bold mb-2">
                                How many jokers are in game: {jokerCount()}
                            </label>
                            <input
                                type="range"
                                class={`${
                                    isOwner()
                                        ? 'cursor-pointer'
                                        : 'disabled:opacity-75 cursor-not-allowed'
                                }`}
                                min="0"
                                max={deckCount() * 4}
                                value={jokerCount()}
                                onInput={(e) =>
                                    handleJokerCount(
                                        parseInt(e.currentTarget.value),
                                    )
                                }
                                disabled={!isOwner()}
                            />
                        </form>
                        <div class="border-r border-blue-400 h-40 ml-10 mr-10" />
                        <div class="flex flex-col justify-center items-center ml-8">
                            <div class="bg-white rounded-lg shadow-lg p-6">
                                <p class="text-lg font-bold mb-2">
                                    Current Players: {currentPlayerCount()} /{' '}
                                    {maxPlayerCount()}
                                </p>
                                <p class="text-lg font-bold mb-2">Players:</p>
                                <ul class="list">
                                    <PlayerList />
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 justify-center">
                        <button
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => writeClipboard(roomCode())}
                        >
                            Copy room code
                        </button>
                    </div>
                    <div class="mt-6 justify-center">
                        <button
                            class={`bg-blue-500  ${
                                isOwner()
                                    ? 'hover:bg-blue-700'
                                    : 'disabled:opacity-75 cursor-not-allowed'
                            }  text-white font-bold py-2 px-4 rounded`}
                            onClick={() => startGame()}
                            disabled={!isOwner()}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default WaitingRoom;
