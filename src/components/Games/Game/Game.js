import React, { useState } from "react";
import PlayerField from "./PlayerField";
import Hand from "./Hand";

function Game({ hand, deck, user, gameState, sendDiscardCard, sendPlayCard, sendPlayCurseCard }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const isCurrentPlayer =
    gameState.players[gameState.currentPlayer].id === user.uid;

  const slotColors = {
    Crèdes: "red",
    "Ordre de la Vérité": "blue",
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
  const isSlotBlocked = (slotIndex, card, isOpponentSlot = false) => {
    console.log("isSlotBlocked", card.value);
    if (card.value === 8) {
      // Карты порчи не могут быть сыграны в пустой слот
      if (isOpponentSlot) {
        const opponent = gameState.players.find((p) => p.id !== user.uid);
        const slotHasCards = opponent.table.some((c) => c.slot === slotIndex);
        if (!slotHasCards) return true; // Слот пуст, нельзя сыграть порчу
        if (card.suit === "Mercenaires") {
          return false; // Mercenaires можно положить в любой слот
        }
        const slotSuit = Object.keys(slotColors)[slotIndex];
        return card.suit !== slotSuit; // Проверяем соответствие масти
      } else {
        return true; // Нельзя играть порчу на свой слот
      }
    } else {
      if (card.suit === "Mercenaires") {
        return false; // Mercenaires можно сыграть в любой слот
      }
      const slotSuit = Object.keys(slotColors)[slotIndex];
      return card.suit !== slotSuit;
    }
  };

  // Сброс карты
  const discardCard = (card) => {
    // Отправляем сообщение на сервер о сбросе карты
    sendDiscardCard(card);

    // После отправки, сбрасываем выбранную карту
    setSelectedCard(null);
  };

  // Розыгрыш карты на своём поле
  const playCard = (card, slotIndex, targetPlayerId) => {
    console.log("play card");
    if (card.value === "8") {
      // Это карта порчи
      if (!isSlotBlocked(slotIndex, card, true)) {
        sendPlayCurseCard(card, slotIndex, targetPlayerId);
        console.log("play curse card");
      } else {
        console.log("Cannot play curse card on this slot");
      }
    } else {
      // Обычная карта
      if (!isSlotBlocked(slotIndex, card)) {
        sendPlayCard(card, slotIndex);
      } else {
        console.log("Cannot play card on this slot");
      }
    }
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
                onSlotClick={(slotIndex) => {
                  console.log("opponent click", selectedCard, selectedCard.value);
                  if (selectedCard && selectedCard.value === "8") {
                    console.log("play opponent field");
                    playCard(selectedCard, slotIndex, player.id);
                  }
                }}
                onDropCard={() => {}}
                currentPlayer={gameState.currentPlayer}
                slotColors={slotColors}
                isOpponentSlot={true}
              />
              {getPlayerStatusMessage(index)}
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
        {getPlayerStatusMessage(
          gameState.players.findIndex((p) => p.id === user.uid)
        )}
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
