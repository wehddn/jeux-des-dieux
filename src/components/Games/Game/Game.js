import React, { useState, useEffect } from "react";
import PlayerField from "./PlayerField";
import Hand from "./Hand";

function Game({ hand, table, deck, ws, user }) {
  const [gameState, setGameState] = useState({
    deck: deck, // Изначально берем колоду из props
    players: table, // Игроки и их поля
    discardPile: [], // Сброс карт
    currentPlayer: 0, // Номер текущего игрока
    turn: 0, // Счетчик ходов
  });
  const [selectedCard, setSelectedCard] = useState(null);

  // Цвета для слотов (по классам)
  const slotColors = {
    Креды: "red",
    ОИ: "blue",
    Каперы: "green",
    Фаготы: "purple",
  };

  // Слушаем сообщения от WebSocket
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'gameState') {
          setGameState(message.data); // Обновляем состояние игры при получении данных от WebSocket
        }
      };
    }

    return () => {
      if (ws) ws.close(); // Закрываем WebSocket при размонтировании компонента
    };
  }, [ws]);

  // Функция вытягивания карты из колоды
  function drawCardFromDeck() {
    if (gameState.deck.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'drawCard', playerIndex: gameState.currentPlayer }));
    } else {
      console.log("No cards left in the deck or WebSocket not open");
    }
  }

  // Игра карты на стол или в сброс
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

  // Когда игрок кликает на карту
  function onCardClick(card) {
    setSelectedCard(card);
  }

  // Когда игрок выбирает слот для карты
  function onSlotClick(slotIndex) {
    if (selectedCard) {
      playCard(selectedCard, slotIndex);
      setSelectedCard(null);
      endTurn();
    }
  }

  // Перетаскивание карты в слот
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

  // Сброс карты в биту
  function discardCard(card) {
    setGameState((prevState) => ({
      ...prevState,
      discardPile: [...prevState.discardPile, card],
      players: prevState.players.map((player, index) => {
        if (index === gameState.currentPlayer) {
          return {
            ...player,
            hand: player.hand.filter(c => c !== card),
          };
        }
        return player;
      })
    }));
    endTurn();
  }

  // Функция завершения хода
  function endTurn() {
    setGameState((prevState) => {
      const nextPlayer = (prevState.currentPlayer + 1) % 2;
      const nextTurn = prevState.turn + 1;

      if (prevState.deck.length === 0) {
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

  console.log("gameState", gameState)

  // Основной рендер компонента
  return (
    <div className="game">
      <div className="fields">
        {gameState.players.map((player, index) => (
          <PlayerField
            key={index}
            player={player}
            index={index}
            colors={Object.values(slotColors)} // Передаем цвета для слотов
            onSlotClick={onSlotClick}
            onDropCard={(e, slotIndex) => onDropCard(e, index, slotIndex)}
            currentPlayer={gameState.currentPlayer}
            slotColors={slotColors} // Передаем объект с цветами слотов
          />
        ))}
      </div>
      <div className="deck-and-discard">
        <div
          className="discard-pile"
          style={{ cursor: 'pointer', padding: '10px', border: '1px solid black' }}
        >
          Discard Pile: {gameState.discardPile.length} cards
        </div>
        <div 
          className="deck" 
          onClick={drawCardFromDeck}
          style={{ cursor: 'pointer', padding: '10px', border: '1px solid black' }}
        >
          Deck: {gameState.deck.length} cards {/* Отображаем количество карт в колоде */}
        </div>
      </div>
      <Hand
        cards={hand || []}
        onCardClick={onCardClick}
        onCardDoubleClick={discardCard}
      />
    </div>
  );
}

export default Game;