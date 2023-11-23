import { ICardProps } from './Card/Card';
import * as utils from './ga-utils';

class DeckStateManager {
    private deckCount: number;
    private defaultCard: ICardProps;

    public decks: Array<ICardProps>;

    constructor(deckCount: number, defaultCard: ICardProps) {
        this.deckCount = deckCount;
        this.defaultCard = defaultCard;

        this.decks = utils.shuffleDeck(utils.generateDeckArray(defaultCard));
    }

    getDeck() {
        return this.decks;
    }

    updateCardPos(
        cardId: number | undefined,
        pos: { x: number; y: number },
    ): { newDeck: ICardProps[]; index: number } {
        if (typeof cardId === 'undefined')
            return { newDeck: this.decks, index: -1 };

        const index = this.decks.findIndex((card) => card.id === cardId);
        const newCard: ICardProps = {
            ...this.decks[index],
            pos,
        };

        this.decks = this.decks.map((card, i) =>
            i === index ? newCard : card,
        );

        return { newDeck: this.decks, index };
    }
}

export default DeckStateManager;
