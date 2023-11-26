import { Component, createSignal, For, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { writeClipboard } from '@solid-primitives/clipboard';
import { get, setAuthHeaders } from '../../utils/axios';

const WaitingRoom: Component = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = createSignal<number[]>([]);
    const [currentPlayerCount, setCurrentPlayerCount] = createSignal(0);
    const [maxPlayerCount, setMaxPlayerCount] = createSignal(4);
    const [roomCode, setRoomCode] = createSignal('');
    const [deckCount, setDeckCount] = createSignal(1);
    const [cardsPerPlayer, setCardsPerPlayer] = createSignal(0);
    const [jokerCount, setJokerCount] = createSignal(0);

    type RoomInfo = {
        roomInfo: {
            maxPlayers: number;
            pinCode: string | null;
            players: number[];
            ownerId: number;
            roomCode: string;
        };
    };

    onMount(async () => {
        const token = localStorage.getItem('token');

        setAuthHeaders(token);

        try {
            const { data, status } = await get<RoomInfo>('/room/info');

            if (status !== 200 || data.roomInfo === null) {
                return;
            }

            setPlayers(data.roomInfo.players);
            setCurrentPlayerCount(data.roomInfo.players.length);
            setMaxPlayerCount(data.roomInfo.maxPlayers);
            setRoomCode(data.roomInfo.roomCode);
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
                            class="cursor-pointer"
                            min="1"
                            max="2"
                            value={deckCount()}
                            onInput={(e) =>
                                setDeckCount(parseInt(e.currentTarget.value))
                            }
                        />
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                            How many cards are dealt to players:{' '}
                            {cardsPerPlayer()}
                        </label>
                        <input
                            type="range"
                            class="cursor-pointer"
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
                        />
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                            How many jokers are in game: {jokerCount()}
                        </label>
                        <input
                            type="range"
                            class="cursor-pointer"
                            min="0"
                            max={deckCount() * 4}
                            value={jokerCount()}
                            onInput={(e) =>
                                setJokerCount(parseInt(e.currentTarget.value))
                            }
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
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => startGame()}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

export default WaitingRoom;
