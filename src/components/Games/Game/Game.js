import React, { useState } from "react";
import PlayerField from "./PlayerField";
import Hand from "./Hand";

function Game({ hand, table, deck, ws, user, gameState, setGameState, sendDrawCard }) {
  const [selectedCard, setSelectedCard] = useState(null);

  const slotColors = {
    Crèdes: "red",
    'Ordre de la Vérité': "blue",
    Capères: "green",
    Phagots: "purple",
  };

  function drawCardFromDeck() {
    if (deck > 0 && ws && ws.readyState === WebSocket.OPEN) {
      sendDrawCard();
    } else {
      console.log("No cards left in the deck or WebSocket not open");
    }
  }

  function playCard(card, slotIndex, playerIndex = gameState.currentPlayer) {
    setGameState((prevState) => {
      const newPlayers = prevState.players.map((player, i) => {
        if (i === playerIndex) {
          return {
            ...player,
            table: [...player.table, { ...card, slot: slotIndex }],
          };
        }
        return player;
      });

      return {
        ...prevState,
        players: newPlayers,
      };
    });
  }

  function onCardClick(card) {
    setSelectedCard(card);
  }

  function onSlotClick(slotIndex) {
    if (selectedCard) {
      playCard(selectedCard, slotIndex);
      setSelectedCard(null);
      endTurn();
    }
  }

  function onDropCard(e, playerIndex, slotIndex) {
    const cardData = e.dataTransfer.getData("card");

    if (!cardData) {
      console.error("No card data found in drag event.");
      return;
    }

    try {
      const card = JSON.parse(cardData);
      console.log('Dropped card:', card);
      playCard(card, slotIndex, playerIndex);
      endTurn();
    } catch (error) {
      console.error("Error parsing card data:", error);
    }
  }

  function discardCard(card) {
    setGameState((prevState) => ({
      ...prevState,
      discardPile: prevState.discardPile + 1,
      players: prevState.players.map((player, index) => {
        if (index === gameState.currentPlayer) {
          return {
            ...player,
            hand: prevState.players[index].hand.filter(c => c !== card),
          };
        }
        return player;
      })
    }));
    endTurn();
  }

  function endTurn() {
    setGameState((prevState) => {
      const nextPlayer = (prevState.currentPlayer + 1) % prevState.players.length;
      const nextTurn = prevState.turn + 1;

      if (prevState.deck === 0) {
        alert("Игра окончена! Карты в колоде закончились.");
        return prevState;
      }

      return {
        ...prevState,
        currentPlayer: nextPlayer,
        turn: nextTurn,
      };
    });

    drawCardFromDeck();
  }

  console.log("gameState", gameState);

  return (
    <div className="game">
      <div className="opponent-field">
        {gameState.players
          .filter((_, index) => index !== gameState.currentPlayer)
          .map((player, index) => (
            <PlayerField
              key={index}
              player={player}
              index={index}
              colors={Object.values(slotColors)}
              onSlotClick={onSlotClick}
              onDropCard={(e, slotIndex) => onDropCard(e, index, slotIndex)}
              currentPlayer={gameState.currentPlayer}
              slotColors={slotColors}
            />
          ))}
      </div>

      <div className="deck-and-discard">
        <div
          className="discard-pile"
          style={{ cursor: "pointer", padding: "10px", border: "1px solid black" }}
        >
          Discard Pile: {gameState.discardPile} cards
        </div>
        <div
          className="deck"
          onClick={drawCardFromDeck}
          style={{ cursor: "pointer", padding: "10px", border: "1px solid black" }}
        >
          Deck: {deck} cards
        </div>
      </div>

      <div className="player-field">
        <PlayerField
          player={gameState.players[gameState.currentPlayer]}
          index={gameState.currentPlayer}
          colors={Object.values(slotColors)}
          onSlotClick={onSlotClick}
          onDropCard={(e, slotIndex) =>
            onDropCard(e, gameState.currentPlayer, slotIndex)
          }
          currentPlayer={gameState.currentPlayer}
          slotColors={slotColors}
        />
      </div>

      <Hand cards={hand || []} onCardClick={onCardClick} onCardDoubleClick={discardCard} />
    </div>
  );
}

export default Game;
