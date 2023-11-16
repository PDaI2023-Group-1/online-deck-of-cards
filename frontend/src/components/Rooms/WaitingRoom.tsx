import { Component, createSignal, For, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const WaitingRoom: Component = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = createSignal([]);
    const [currentPlayerCount, setCurrentPlayerCount] = createSignal(0);
    const [maxPlayerCount, setMaxPlayerCount] = createSignal(4);
    const [roomCode, setRoomCode] = createSignal('');

    createEffect(async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(
            'http://127.0.0.1:8080/room/info',
            config,
        );
        setPlayers(response.data.roomInfo.players);
        setCurrentPlayerCount(response.data.roomInfo.players.length);
        setMaxPlayerCount(response.data.roomInfo.maxPlayers);
        setRoomCode(response.data.roomInfo.roomCode);
    });

    return (
        <div class="flex flex-col items-center justify-center h-screen">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <p class="text-lg font-bold mb-2">
                    Current Players: {currentPlayerCount()} / {maxPlayerCount()}
                </p>
                <p class="text-lg font-bold mb-2">Players:</p>
                <ul class="list-disc pl-5">
                    <For each={players()}>
                        {(player, i) => {
                            return <li>{player}</li>;
                        }}
                    </For>
                </ul>
            </div>

            <div class="mt-6">
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
