import React, { useState } from "react";
import PlayerField from "./PlayerField";
import Hand from "./Hand";

function Game({ hand, deck, user, gameState, sendDiscardCard, sendPlayCard }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const isCurrentPlayer = gameState.players[gameState.currentPlayer].id === user.uid;

  const slotColors = {
    Crèdes: "red",
    'Ordre de la Vérité': "blue",
    Capères: "green",
    Phagots: "purple",
  };
  
  // Отображение статуса игрока (Твой ход / Ход противника)
  const getPlayerStatusMessage = (playerIndex) => {
    if (playerIndex === gameState.currentPlayer) {
      return <p style={{ color: "green" }}>Твой ход</p>;
    }
    return <p style={{ color: "red" }}>Ход противника</p>;
  };

  // Блокировка слотов на поле для карт с неподходящей мастью
const isSlotBlocked = (slotIndex, card) => {
  if (card.suit === "Mercenaires") {
    return false; // "Mercenaires" можно сыграть в любой слот
  }
  const slotSuit = Object.keys(slotColors)[slotIndex];
  return card.suit !== slotSuit;
};

  // Сброс карты
  const discardCard = (card) => {
    // Отправляем сообщение на сервер о сбросе карты
    sendDiscardCard(card);

    // После отправки, сбрасываем выбранную карту
    setSelectedCard(null);
  };

  // Розыгрыш карты на своём поле
  const playCard = (card, slotIndex) => {
    if (isSlotBlocked(slotIndex, card)) {
      console.log("Cannot play card on this slot");
      return;
    }

    // Отправляем сообщение на сервер о розыгрыше карты
    sendPlayCard(card, slotIndex);

    // После отправки, сбрасываем выбранную карту
    setSelectedCard(null);
  };

  return (
    <div className="game">
      <div className="opponent-field">
        {gameState.players
          .filter((player) => player.id !== user.uid)
          .map((player, index) => (
            <div key={player.id}>
              <PlayerField
                player={player}
                index={index}
                colors={Object.values(slotColors)}
                onSlotClick={() => {}}
                onDropCard={() => {}}
                currentPlayer={gameState.currentPlayer}
                slotColors={slotColors}
                blocked={true} // Блокируем поле противника
              />
            </div>
          ))}
      </div>

      <div className="deck-and-discard">
        <div
          className="discard-pile"
          style={{ padding: "10px", border: "1px solid black" }}
        >
          Сброс: {gameState.discardPile.length} карт
        </div>
        <div
          className="deck"
          style={{ padding: "10px", border: "1px solid black" }}
        >
          Колода: {deck.length} карт
        </div>
      </div>

      <div className="player-field">
        <PlayerField
          player={gameState.players.find((p) => p.id === user.uid)}
          index={gameState.players.findIndex((p) => p.id === user.uid)}
          colors={Object.values(slotColors)}
          onSlotClick={(slotIndex) => {
            if (selectedCard && !isSlotBlocked(slotIndex, selectedCard)) {
              playCard(selectedCard, slotIndex);
            }
          }}
          onDropCard={() => {}}
          currentPlayer={gameState.currentPlayer}
          slotColors={slotColors}
        />
        {getPlayerStatusMessage(gameState.players.findIndex((p) => p.id === user.uid))}
      </div>

      <Hand
        cards={hand || []}
        onCardClick={(card) => {
          setSelectedCard(card);
        }}
        onCardDoubleClick={(card) => discardCard(card)}
        isCurrentPlayer={isCurrentPlayer} // Блокируем карты для противника
      />
    </div>
  );
}

export default Game;
