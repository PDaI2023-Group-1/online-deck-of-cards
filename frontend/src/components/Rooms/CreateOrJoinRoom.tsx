import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const CreateOrJoinRoom: Component = () => {
    const [roomCode, setRoomCode] = createSignal<string>('');
    const [maxPlayers, setMaxPlayers] = createSignal<number>(4);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };

    const createRoom = async () => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:8080/room',
                { maxPlayers: maxPlayers() },
                config,
            );

            if (response.status === 201) {
                localStorage.setItem('token', response.data.token);
                navigate('/room/' + response.data.roomCode);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const joinRoom = async () => {
        if (roomCode() === '') {
            return;
        }

        try {
            const response = await axios.put(
                'http://127.0.0.1:8080/room/' + roomCode(),
                null,
                config,
            );
            console.log(response);
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                navigate('/room/' + roomCode());
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div class="h-screen flex justify-center items-center">
            <div class="flex flex-col justify-center items-center mr-8">
                <form>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                        Max players: {maxPlayers()}
                    </label>
                    <input
                        type="range"
                        min="2"
                        max="8"
                        class="cursor-pointer"
                        value={maxPlayers()}
                        onInput={(e) =>
                            setMaxPlayers(parseInt(e.currentTarget.value))
                        }
                    />
                </form>
                <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={createRoom}
                >
                    Create Room
                </button>
            </div>
            <div class="border-r border-blue-400 h-40" />
            <div class="flex flex-col justify-center items-center ml-8">
                <form>
                    <label class="block text-gray-700 text-sm font-bold mb-2">
                        Room code:
                    </label>
                    <input
                        class="border rounded py-2 px-3 text-grey-darkest mb-4"
                        type="text"
                        placeholder="Enter room code"
                        value={roomCode()}
                        onInput={(e) => setRoomCode(e.currentTarget.value)}
                    />
                </form>

                <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={joinRoom}
                >
                    Join Room
                </button>
            </div>
        </div>
    );
};

export default CreateOrJoinRoom;
