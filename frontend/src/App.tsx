import type { Component } from 'solid-js';
import Header from './components/Header/Header';

const App: Component = () => {
    return (
        <>
            <Header />
            <div class="mx-auto mb-12 p-5 w-1/2">
                <h1 class="text-center text-4xl font-semibold text-blue-500 mb-3">
                    Features
                </h1>
                <ul class="list-outside list-disc">
                    <li class="list-item text-lg">
                        Freeplay with your friends online
                        <ul class="list-inside list-disc">
                            <li class="list-item text-lg">No forced rules!</li>
                            <li class="list-item text-lg">
                                Concurrent play! No need to wait for turns
                            </li>
                            <li class="list-item text-lg">No registration!</li>
                            <li class="list-item text-lg">Low latency!</li>
                        </ul>
                    </li>
                    <li class="list-item text-lg">
                        Ad facilis aspernatur debitis optio fuga aut voluptatum,
                    </li>
                    <li class="list-item text-lg">
                        exercitationem asperiores expedita fugit illo quis
                    </li>
                    <li class="list-item text-lg">
                        cupiditate. Qui iste rem laboriosam atque laudantium
                        vitae.
                    </li>
                </ul>
            </div>
            <div class="grid gap grid-cols-2 grid-rows-1">
                <div class="m-10 p-5">
                    <h1 class="text-2xl font-semibold text-blue-500 mb-2">
                        Guide
                    </h1>
                    <p class="text-lg">
                        2 Lorem ipsum dolor sit amet consectetur adipisicing
                        elit. Ad facilis aspernatur debitis optio fuga aut
                        voluptatum, exercitationem asperiores expedita fugit
                        illo quis cupiditate. Qui iste rem laboriosam atque
                        laudantium vitae.
                    </p>
                </div>
                <div class="m-10 p-5">
                    <h1 class="text-2xl font-semibold text-blue-500 mb-2">
                        How it works
                    </h1>
                    <p class="text-lg ">
                        3 Lorem ipsum dolor sit amet consectetur adipisicing
                        elit. Ad facilis aspernatur debitis optio fuga aut
                        voluptatum, exercitationem asperiores expedita fugit
                        illo quis cupiditate. Qui iste rem laboriosam atque
                        laudantium vitae.
                    </p>
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
