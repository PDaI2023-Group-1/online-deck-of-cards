import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const Header: Component = () => {
    const nav = useNavigate();
    return (
        <>
            <header class="mx-auto flex items-center justify-between p-2 pr-12 pl-12 h-fit">
                <button
                    class="bg-transparent text-blue-500 hover:bg-blue-500 hover:text-white w-2/12 mx-12 rounded-lg outline-1 outline outline-blue-700 text-center h-fit font-bold text-lg"
                    onClick={() => nav('/test/')}
                >
                    Home
                </button>
                <button
                    class="bg-transparent text-blue-500 hover:bg-blue-500 hover:text-white w-2/12 mx-12 rounded-lg outline-1 outline outline-blue-700 text-center h-fit font-bold text-lg"
                    onClick={() => nav('/user')}
                >
                    Create Game
                </button>
                <button
                    class="bg-transparent text-blue-500 hover:bg-blue-500 hover:text-white w-2/12 mx-12 rounded-lg outline-1 outline outline-blue-700 text-center h-fit font-bold text-lg"
                    onClick={() => nav('/user')}
                >
                    Create User
                </button>
            </header>
            <section class="bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px mt-4 mb-10" />
        </>
    );
};

export default Header;
