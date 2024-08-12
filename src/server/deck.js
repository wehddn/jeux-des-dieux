function generateDeck() {
  const classes = ["Креды", "ОИ", "Каперы", "Фаготы", "Наемники"];
  const values = ["1", "2", "3", "4", "5", "6", "7"];
  let deck = [];

  classes.forEach((cls) => {
    values.forEach((value) => {
      deck.push({ suit: cls, value });
    });
  });

  const curses = ["Креды", "ОИ", "Каперы", "Фаготы"];
  curses.forEach((cls) => {
    for (let i = 0; i < 4; i++) {
      deck.push({ suit: `ПОРЧА ${cls}`, value: "ПОРЧА", isCurse: true });
    }
  });

  for (let i = 0; i < 2; i++) {
    deck.push({ suit: "ПОРЧА любого класса", value: "ПОРЧА", isCurse: true });
  }

  return shuffle(deck);
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawInitialCards(deck) {
  return deck.splice(0, 6);
}

module.exports = {
  generateDeck,
  shuffle,
  drawInitialCards
};