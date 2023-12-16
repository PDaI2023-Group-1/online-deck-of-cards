import type { Component } from 'solid-js';
import Header from './components/Header/Header';

const App: Component = () => {
    return (
        <>
            <Header />
            <div class="mx-14">
                <div class="mx-auto mb-12 p-5 w-1/2">
                    <h1 class="text-center text-6xl font-semibold text-blue-500 mb-3">
                        Features
                    </h1>
                    <ul class="list-outside list-disc">
                        <li class="list-item text-xl">
                            Freeplay with your friends online
                            <ul class="list-inside list-disc">
                                <li class="list-item text-xl">
                                    No forced rules!
                                </li>
                                <li class="list-item text-xl">
                                    Concurrent play! No need to wait for turns
                                </li>
                                <li class="list-item text-xl">
                                    No registration!
                                </li>
                                <li class="list-item text-xl">Low latency!</li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="grid gap grid-cols-2 grid-rows-1">
                    <div class="m-10 p-5">
                        <h1 class="text-4xl font-semibold text-blue-500 mb-4">
                            Guide
                        </h1>
                        <p class="text-xl">
                            If you are manually running this refer to the README
                            for instructions. <br />
                            If you are here to play just click Create Game (only
                            guest users are allowed as of now) <br />
                            Select "Continue as Guest" <br />
                            If you got invited to a game just enter the room
                            code and wait for the host! <br />
                            If you want to create your own game just select the
                            max players and click create room <br />
                            When you want to invite more players just hit "Copy
                            room code" and send it to your friends and have them
                            follow these instructions! <br />
                            You can also set some basic game configurations from
                            this screen
                        </p>
                    </div>
                    <div class="m-10 p-5">
                        <h1 class="text-4xl font-semibold text-blue-500 mb-4">
                            Work in progress
                        </h1>
                        <p class="text-xl ">
                            Incase you stumbled upon this by accident feel free
                            to take a look around in{' '}
                            <a
                                href="https://github.com/PDaI2023-Group-1/online-deck-of-cards/issues"
                                target="_blank"
                                referrerPolicy="no-referrer"
                                class=" text-blue-600 hover:underline"
                            >
                                our GitHub repository!
                            </a>
                            <br />
                            This site is done with SolidJS and just native HTML
                            features. The game could be better if it was made
                            with an actual engine or WebGL but this way is more
                            fun!
                        </p>
                    </div>
                </div>
            </div>
            <footer class="bg-blue-100 fixed p-1 text-sm w-full bottom-0">
                Made by Lasse Suomela, Santeri Knihtilä, Aappo Launonen and Miko
                Prykäri during a third year project period
            </footer>
        </>
    );
};

export default App;
