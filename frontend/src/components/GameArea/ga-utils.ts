import { ICardProps } from './Card/Card';

function generateDeckArray(defaultProps: ICardProps): Array<ICardProps> {
    let arr: Array<ICardProps> = [];

    for (let suit = 0; suit < 4; suit++) {
        for (let value = 0; value < 13; value++) {
            arr = [
                ...arr,
                {
                    ...defaultProps,
                    value: value + 1,
                    suit: suit,
                    id: value + suit * 13,
                },
            ];
        }
    }

    return arr;
}

function addDeck(
    deck: Array<ICardProps>,
    defaultProps: ICardProps,
): Array<ICardProps> {
    const len = deck.length;

    deck = deck.sort((a, b) => a.id - b.id);

    for (let suit = 0; suit < 4; suit++) {
        for (let value = 0; value < 13; value++) {
            deck = [
                ...deck,
                {
                    ...defaultProps,
                    value: value + 1,
                    suit: suit,
                    id: len + value + suit * 13,
                },
            ];
        }
    }

    return deck;
}

function shuffleDeck(deck: Array<ICardProps>): Array<ICardProps> {
    let m = deck.length,
        t,
        i;

    while (m) {
        i = Math.floor(Math.random() * m--);

        t = deck[m];
        deck[m] = deck[i];
        deck[i] = t;
    }

    return deck;
}

export { generateDeckArray, addDeck, shuffleDeck };
