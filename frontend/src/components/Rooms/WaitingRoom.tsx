import { Component, createSignal, For, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';
import { writeClipboard } from '@solid-primitives/clipboard';

const WaitingRoom: Component = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = createSignal([]);
    const [currentPlayerCount, setCurrentPlayerCount] = createSignal(0);
    const [maxPlayerCount, setMaxPlayerCount] = createSignal(4);
    const [roomCode, setRoomCode] = createSignal('');
    const [deckCount, setDeckCount] = createSignal(1);
    const [cardsPerPlayer, setCardsPerPlayer] = createSignal(0);
    const [jokerCount, setJokerCount] = createSignal(0);

    createEffect(() => {
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        axios
            .get('http://127.0.0.1:8080/room/info', config)
            .then((response) => {
                setPlayers(response.data.roomInfo.players);
                setCurrentPlayerCount(response.data.roomInfo.players.length);
                setMaxPlayerCount(response.data.roomInfo.maxPlayers);
                setRoomCode(response.data.roomInfo.roomCode);
            })
            .catch((error) => {
                console.error(error);
            });

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
                    onClick={() => navigate('/game/' + roomCode())}
                >
                    Start Game
                </button>
            </div>
        </div>
    );
};

export default WaitingRoom;
