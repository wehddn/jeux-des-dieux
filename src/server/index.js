const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameState = {
  deck: generateDeck(),
  players: [
    { hand: [], table: [], curses: {} },
    { hand: [], table: [], curses: {} },
  ],
  discardPile: [],
};

// Функция для генерации и перемешивания колоды
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

// Функция для перемешивания колоды
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Инициализация колоды
gameState.deck = generateDeck();

wss.on('connection', (ws) => {
  // Отправка текущего состояния игры новому подключенному клиенту
  ws.send(JSON.stringify({ type: 'gameState', data: gameState }));

  ws.on('message', (message) => {
    const { type, data } = JSON.parse(message);
    
    // Обработка различных типов сообщений
    switch(type) {
      case 'drawCard':
        console.log('drawCard');
        drawCard(data.playerIndex);
        break;
      case 'playCard':
        playCard(data.playerIndex, data.card, data.slotIndex);
        break;
      // Добавьте другие типы действий игры
    }

    // Рассылка обновленного состояния всем клиентам
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'gameState', data: gameState }));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Функция для вытягивания карты из колоды
function drawCard(playerIndex) {
  if (gameState.deck.length === 0) return; // Проверка, есть ли карты в колоде

  const newCard = gameState.deck.pop(); // Вытягиваем карту из колоды
  gameState.players[playerIndex].hand.push(newCard); // Добавляем карту в руку игрока
}

// Функция для игры картой
function playCard(playerIndex, card, slotIndex) {
  // Ищем карту в руке игрока
  const player = gameState.players[playerIndex];
  const cardIndex = player.hand.findIndex(
    (c) => c.suit === card.suit && c.value === card.value
  );

  if (cardIndex !== -1) {
    const playedCard = player.hand.splice(cardIndex, 1)[0]; // Удаляем карту из руки

    if (playedCard.isCurse) {
      // Логика для применения проклятия
      const curseKey = playedCard.suit.split(" ")[1];
      player.curses[curseKey] = (player.curses[curseKey] || 0) + 1;
    } else {
      // Логика для размещения карты на столе
      player.table.push({ ...playedCard, slot: slotIndex });
    }

    // Добавление карты в отбой (опционально)
    gameState.discardPile.push(playedCard);
  }
}

server.listen(3001, () => {
  console.log('Server is listening on port 3001');
});
