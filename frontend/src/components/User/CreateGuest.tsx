import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const CreateGuest: Component = () => {
    const navigate = useNavigate();

    const createGuest = async () => {
        try {
            const data = await axios.post('http://127.0.0.1:8080/user/guest');
            console.log(data);
            if (data.status === 201) {
                localStorage.setItem('token', data.data.token);
                navigate('/room/create');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div class="flex justify-center items-center h-screen">
            <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={createGuest}
            >
                Continue as Guest
            </button>
        </div>
    );
};

export default CreateGuest;
