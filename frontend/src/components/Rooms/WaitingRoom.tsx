import { Component, createSignal, For, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';
import { writeClipboard } from '@solid-primitives/clipboard';
import WSClient from '../../API/WSClient';
import { jwtDecode } from 'jwt-decode';
import { PlayerChanged } from '../../../types/custom';

const WaitingRoom: Component = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = createSignal<string[]>([]);
    const [currentPlayerCount, setCurrentPlayerCount] = createSignal(0);
    const [maxPlayerCount, setMaxPlayerCount] = createSignal(4);
    const [roomCode, setRoomCode] = createSignal('');
    const [deckCount, setDeckCount] = createSignal(1);
    const [cardsPerPlayer, setCardsPerPlayer] = createSignal(0);
    const [jokerCount, setJokerCount] = createSignal(0);
    const [isOwner, setIsOwner] = createSignal(false);

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

    onMount(async () => {
        const token = localStorage.getItem('token');
        if (token === null) {
            return;
        }
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            const { data, status } = await axios.get<RoomInfo>(
                'http://127.0.0.1:8080/room/info',
                config,
            );

            if (status !== 200 || data.roomInfo === null) {
                return;
            }

            const decodedToken = jwtDecode<Token>(token);

            setPlayers([decodedToken.username]);
            setCurrentPlayerCount(players().length);
            setMaxPlayerCount(data.roomInfo.maxPlayers);
            setRoomCode(data.roomInfo.roomCode);
            setIsOwner(decodedToken.isOwner!);

            const wsClient = new WSClient('');

            wsClient.onOpen(() => {
                console.log('WebSocket connection is open.');
                wsClient.authorize(token);
            });

            wsClient.onMessage((data) => {
                console.log(data);

                if (data.event === 'authorized') {
                    if (!decodedToken.isOwner) {
                        console.log('send join room');
                        wsClient.joinRoom();
                    } else {
                        console.log('send create room');
                        wsClient.createRoom();
                    }
                }

                if (data.event === 'player-joined') {
                    console.log('joined');
                    const usernames = [...players(), data.username];
                    setPlayers(usernames);
                    setCurrentPlayerCount(usernames.length);
                }

                if (data.event === 'player-left') {
                    console.log('left');
                    const newPlayers = players().filter(
                        (player) => player !== data.username,
                    );
                    setPlayers(newPlayers);
                    setCurrentPlayerCount(currentPlayerCount() - 1);
                }
            });
        } catch (error) {
            console.error(error);
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
                    return <li>{player}</li>;
                }}
            </For>
        );
    };

    const startGame = () => {
        if (roomCode() !== '') {
            navigate('/game/' + roomCode());
        }
    };

    return (
        <div class="flex flex-col justify-center items-center h-screen">
            <div class="flex justify-center items-center">
                <div class="flex flex-col justify-center items-center mr-8">
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
                                setDeckCount(parseInt(e.currentTarget.value))
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
                                setCardsPerPlayer(
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
                                setJokerCount(parseInt(e.currentTarget.value))
                            }
                            disabled={!isOwner()}
                        />
                    </form>
                </div>
                <div class="border-r border-blue-400 h-40" />
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
    );
};

export default WaitingRoom;
