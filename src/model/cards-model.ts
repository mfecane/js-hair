interface Card {
  x: number
  y: number
  w: number
  h: number
  veriance: number
}

export class CardsModel {
  cards: Card[] = []

  constructor() {}

  clone() {
    const clone = new CardsModel()
    clone.cards = [...this.cards]
    return clone
  }

  addCard() {}
}
