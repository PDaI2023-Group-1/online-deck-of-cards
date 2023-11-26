import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { post } from '../../utils/axios';

type CreateGuestResponse = {
    token: string;
    user: { id: number; username: string };
};

const CreateGuest: Component = () => {
    const navigate = useNavigate();

    const createGuest = async () => {
        try {
            const resp = await post<CreateGuestResponse>('/user/guest', null);
            if (resp.status === 201) {
                localStorage.setItem('token', resp.data.token);
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
