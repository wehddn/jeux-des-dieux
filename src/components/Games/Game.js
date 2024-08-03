import React, { useState } from "react";
import PlayerField from "./PlayerField";
import Hand from "./Hand";

function Game() {
  const [deck, setDeck] = useState(() => generateDeck());
  const [players, setPlayers] = useState(() => [
    { hand: drawInitialCards(), table: [], curses: {} },
    { hand: drawInitialCards(), table: [], curses: {} },
  ]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  const slotColors = {
    Креды: "red",
    ОИ: "blue",
    Каперы: "green",
    Фаготы: "purple",
  };

  function moveCardToSlot(card, slotIndex, targetPlayerIndex) {
  setPlayers((prevPlayers) => {
    return prevPlayers.map((player, i) => {
      if (i === targetPlayerIndex) {
        if (card.isCurse) {
          const className = Object.keys(slotColors)[slotIndex];
          const curseKey =
            card.suit === "ПОРЧА любого класса"
              ? className
              : card.suit.split(" ")[1];
          return {
            ...player,
            hand: player.hand.filter((c) => c !== card),
            curses: {
              ...player.curses,
              [curseKey]: (player.curses[curseKey] || 0) + 1,
            },
          };
        } else {
          const slotSuit = Object.keys(slotColors)[slotIndex];
          if (slotSuit === card.suit || card.suit === "Наемники") {
            return {
              ...player,
              hand: player.hand.filter(
                (c) => c.suit !== card.suit || c.value !== card.value
              ),
              table: [...player.table, { ...card, slot: slotIndex }],
            };
          }
        }
      }
      return player;
    });
  });
  setSelectedCard(null);
}

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

  function drawInitialCards() {
    return [...deck.splice(0, 6)];
  }

  function onDragStart(e, card) {
    e.dataTransfer.setData("card", JSON.stringify(card));
  }

  function onDropCard(e, playerIndex, slotIndex) {
    const cardData = e.dataTransfer.getData("card");
    const card = JSON.parse(cardData);
    moveCardToSlot(card, slotIndex);
  }

  function moveCardToSlot(card, slotIndex) {
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player, i) => {
        if (i === currentPlayer) {
          const slotCards = player.table.filter((c) => c.slot === slotIndex);
          const slotSuit = Object.keys(slotColors)[slotIndex];
          if (
            slotCards.length === 0 ||
            slotCards[0].suit === card.suit ||
            card.suit === "Наемники"
          ) {
            if (card.suit === "Наемники" || card.suit === slotSuit) {
              return {
                ...player,
                hand: player.hand.filter(
                  (c) => c.suit !== card.suit || c.value !== card.value
                ),
                table: [...player.table, { ...card, slot: slotIndex }],
              };
            }
          }
        }
        return player;
      });
    });
    setSelectedCard(null);
  }

  function onCardClick(card) {
    setSelectedCard(card);
  }

  function onSlotClick(slotIndex) {
    if (selectedCard) {
      moveCardToSlot(selectedCard, slotIndex);
    }
  }

  function onCardDoubleClick(card) {
    if (card.suit === "Наемники") {
      placeMercenary(card);
    } else {
      const suitSlot = Object.keys(slotColors).find(
        (suit) => suit === card.suit
      );
      const slotIndex = Object.keys(slotColors).indexOf(suitSlot);
      moveCardToSlot(card, slotIndex);
    }
  }

  function placeMercenary(card) {
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player, i) => {
        if (i === currentPlayer) {
          const slotCounts = Object.keys(slotColors).map(
            (_, slotIndex) =>
              player.table.filter((c) => c.slot === slotIndex).length
          );
          let maxCount = Math.max(...slotCounts);
          let slotIndex = slotCounts.indexOf(maxCount);
          // В случае одинакового количества карт выбираем первое место
          if (slotCounts.filter((count) => count === maxCount).length > 1) {
            slotIndex = slotCounts.findIndex((count) => count === maxCount);
          }
          return {
            ...player,
            hand: player.hand.filter(
              (c) => c.suit !== card.suit || c.value !== card.value
            ),
            table: [...player.table, { ...card, slot: slotIndex }],
          };
        }
        return player;
      });
    });
  }

  function onDropDiscard(e) {
    if (selectedCard) {
      discardCard(selectedCard);
    } else {
      const cardData = e.dataTransfer.getData("card");
      const card = JSON.parse(cardData);
      discardCard(card);
    }
  }

  function discardCard(card) {
    setPlayers((prevPlayers) => {
      return prevPlayers.map((player, i) => {
        if (i === currentPlayer) {
          return {
            ...player,
            hand: player.hand.filter(
              (c) => c.suit !== card.suit || c.value !== card.value
            ),
          };
        }
        return player;
      });
    });
    setDiscardPile((prevDiscardPile) => [...prevDiscardPile, card]);
    setSelectedCard(null);
  }

  function drawCardFromDeck() {
    setDeck((prevDeck) => {
      if (prevDeck.length === 0) return prevDeck;

      const newCard = { ...prevDeck[prevDeck.length - 1] };
      const updatedDeck = prevDeck.slice(0, -1);

      setPlayers((prevPlayers) => {
        const newPlayers = prevPlayers.map((player, index) => {
          if (index === currentPlayer) {
            const isCardInHand = player.hand.some(
              (c) => c.suit === newCard.suit && c.value === newCard.value
            );
            if (!isCardInHand) {
              return {
                ...player,
                hand: [...player.hand, newCard],
              };
            }
          }
          return player;
        });
        return newPlayers;
      });

      return updatedDeck;
    });
  }

  return (
    <div className="game">
      <div className="fields">
        {players.map((player, index) => (
          <PlayerField
            key={index}
            player={player}
            index={index}
            colors={Object.values(slotColors)}
            onDropCard={(e, slotIndex) => onDropCard(e, index, slotIndex)}
            onSlotClick={onSlotClick}
            currentPlayer={currentPlayer}
            slotColors={slotColors}
          />
        ))}
      </div>
      <div className="deck-and-discard">
        <div className="deck" onClick={drawCardFromDeck}>
          Deck: {deck.length} cards
        </div>
        <div
          className="discard-pile"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropDiscard}
          onClick={onDropDiscard}
        >
          Discard Pile: {discardPile.length} cards
        </div>
      </div>
      <Hand
        cards={players[currentPlayer].hand}
        onDragStart={onDragStart}
        onCardClick={onCardClick}
        onCardDoubleClick={onCardDoubleClick}
      />
    </div>
  );
}

export default Game;
