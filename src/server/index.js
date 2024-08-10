const express = require('express');
const WebSocket = require('ws');
const app = express();
const port = 3001;

// Хранилище игр в памяти сервера
const games = {};

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  let gameId;
  let userID;

  ws.on('message', async (message) => {
    try {
      const { type, room, userId } = JSON.parse(message);
      gameId = room;
      userID = userId;
      ws.room = room;

      if (type === 'join') {
        await joinGame(gameId, userId, ws);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
      ws.close();
    }
  });

  ws.on('close', async () => {
    await handleClose(gameId, userID, ws);
  });
});

async function joinGame(gameId, userId, ws) {
  console.log('before getGame:', gameId);
  try {
    let gameData = getGame(gameId);
    if (!gameData) {
      // Инициализация новой игры с колодой и раздачей карт игрокам
      const deck = generateDeck();
      const players = [
        { id: userId, hand: drawInitialCards(deck), table: [], curses: {} }
      ];

      gameData = {
        id: gameId,
        deck: deck,
        players: players,
        started: false
      };

      updateGameData(gameId, gameData);
      ws.send(JSON.stringify({ type: 'joined', room: gameId }));
    } else {
      // Проверяем, находится ли игрок уже в игре
      const existingPlayer = gameData.players.find(player => player.id === userId);

      if (existingPlayer) {
        // Игрок повторно подключается к игре
        ws.send(JSON.stringify({ type: 'rejoined', room: gameId, hand: existingPlayer.hand, table: gameData.players.map(p => ({ id: p.id, table: p.table })) }));
        if (gameData.started) {
          ws.send(JSON.stringify({ type: 'start', room: gameId, hand: existingPlayer.hand, table: gameData.players.map(p => ({ id: p.id, table: p.table })) }));
        }
      } else if (gameData.players.length < 2) {
        // Добавляем нового игрока, если игра еще не началась и есть место
        const newPlayer = { id: userId, hand: drawInitialCards(gameData.deck), table: [], curses: {} };
        gameData.players.push(newPlayer);

        if (gameData.players.length === 2) {
          gameData.started = true;
        }

        updateGameData(gameId, gameData);

        ws.send(JSON.stringify({ type: 'joined', room: gameId }));
        if (gameData.players.length === 2) {
          gameData.players.forEach(player => {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client.room === gameId && client.id === player.id) {
                client.send(JSON.stringify({
                  type: 'start',
                  room: gameId,
                  hand: player.hand,
                  table: gameData.players.map(p => ({ id: p.id, table: p.table }))
                }));
              }
            });
          });
        }
      } else {
        // Игра уже началась, и игрок не может подключиться
        ws.send(JSON.stringify({ type: 'full', room: gameId }));
        ws.close();
      }
    }
  } catch (error) {
    console.error('Error joining game:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
    ws.close();
  }
}

async function handleClose(gameId, userID, ws) {
  if (gameId && userID) {
    try {
      console.log('before getGame:', gameId);
      const gameData = getGame(gameId);
      if (!gameData) return;

      const updatedPlayers = gameData.players.filter(player => player.id !== userID);
      updateGameData(gameId, { ...gameData, players: updatedPlayers });

      if (updatedPlayers.length < 2) {
        updateGameData(gameId, { ...gameData, started: false });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.room === gameId) {
            client.send(JSON.stringify({ type: 'waiting', room: gameId }));
          }
        });
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }
}

function getGame(gameId) {
  return games[gameId];
}

function updateGameData(gameId, gameData) {
  games[gameId] = gameData;
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

function drawInitialCards(deck) {
  return deck.splice(0, 6);
}