import React, { useState, useEffect, useRef } from "react";
import PlayerField from "./PlayerField";
import Hand from "./Hand";

function Game() {
  const [gameState, setGameState] = useState({
    deck: [],
    players: [],
    discardPile: []
  });
  const [currentPlayer] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const ws = useRef(null);

  const slotColors = {
    Креды: "red",
    ОИ: "blue",
    Каперы: "green",
    Фаготы: "purple",
  };

  useEffect(() => {
    // Установление соединения с сервером WebSocket
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'gameState') {
        setGameState(message.data);
      }
    };

    return () => {
      ws.current.close();
    };
  }, []);

  function drawCardFromDeck() {
    console.log("Deck pile clicked");
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'drawCard', playerIndex: currentPlayer }));
    }
  }

  function playCard(card, slotIndex, playerIndex) {
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
    }
  }

  function onDropCard(e, playerIndex, slotIndex) {
    const cardData = e.dataTransfer.getData("card");
    const card = JSON.parse(cardData);
  
    // Убедитесь, что передаете все необходимые параметры и данные
    playCard(card, slotIndex, playerIndex);
  }

  return (
    <div className="game">
      <div className="fields">
        {gameState.players.map((player, index) => (
          <PlayerField
            key={index}
            player={player}
            index={index}
            colors={Object.values(slotColors)}
            onSlotClick={onSlotClick}
            onDropCard={(e, slotIndex) => onDropCard(e, index, slotIndex)}
            currentPlayer={currentPlayer}
            slotColors={slotColors}
          />
        ))}
      </div>
      <div className="deck-and-discard">

        <div
          className="discard-pile"
          onClick={() => console.log("Discard pile clicked")}
          style={{ cursor: 'pointer', padding: '10px', border: '1px solid black' }} // Ensure the discard pile is styled properly
        >
          Discard Pile: {gameState.discardPile.length} cards
        </div>
        <div 
          className="deck" 
          onClick={drawCardFromDeck}
          style={{ cursor: 'pointer', padding: '10px', border: '1px solid black' }} // Ensure the deck is styled properly
        >
          Deck: {gameState.deck.length} cards
        </div>
      </div>
      <Hand
        cards={gameState.players[currentPlayer]?.hand || []}
        onCardClick={onCardClick}
      />
    </div>
  );
}

export default Game;