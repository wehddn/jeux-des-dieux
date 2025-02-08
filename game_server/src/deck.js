function generateDeck() {
  const classes = ["Crèdes", "Ordre de la Vérité", "Capères", "Phagots", "Mercenaires"];
  const values = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let deck = [];

  classes.forEach((cls) => {
    values.forEach((value) => {
      if (value === "8") {
        if (cls === "Mercenaires") {
          for (let i = 0; i < 2; i++) {
            deck.push({ suit: cls, value });
          }
        } else {
          for (let i = 0; i < 4; i++) {
            deck.push({ suit: cls, value });
          }
        }
      } else if (value === "9") {
        for (let i = 0; i < 4; i++) {
          deck.push({ suit: cls, value });
        }
      } else {
        deck.push({ suit: cls, value });
      }
    });
  });

  return shuffle(deck);
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

function drawInitialCards(deck) {
  return deck.splice(0, 4);
}

module.exports = {
  generateDeck,
  shuffle,
  drawInitialCards,
};
