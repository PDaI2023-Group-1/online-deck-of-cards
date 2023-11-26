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

    getDeck(): ICardProps[] {
        return this.decks;
    }

    updateCardPos(
        cardId: number | undefined,
        pos: { x: number; y: number },
    ): { newDeck: ICardProps[]; index: number } {
        if (typeof cardId === 'undefined')
            return { newDeck: this.decks, index: -1 };

        const index = this.findCardIndex(cardId);
        const newCard: ICardProps = {
            ...this.decks[index],
            pos,
        };

        this.decks = this.setCardAtIndex(newCard, index);

        return { newDeck: this.decks, index };
    }

    flipCard(cardId: number | undefined): {
        newDeck: ICardProps[];
        isFaceUp: boolean | undefined;
    } {
        if (typeof cardId === 'undefined')
            return { newDeck: this.decks, isFaceUp: undefined };
        const index = this.findCardIndex(cardId);

        const newCard: ICardProps = {
            ...this.decks[index],
            isFaceUp: !this.decks[index].isFaceUp,
        };

        this.decks = this.setCardAtIndex(newCard, index);
        return { newDeck: this.decks, isFaceUp: this.decks[index].isFaceUp };
    }

    private findCardIndex(cardId: number): number {
        return this.decks.findIndex((card) => card.id === cardId);
    }

    private setCardAtIndex(newCard: ICardProps, index: number): ICardProps[] {
        return (this.decks = this.decks.map((card, i) =>
            i === index ? newCard : card,
        ));
    }
}

export default DeckStateManager;
