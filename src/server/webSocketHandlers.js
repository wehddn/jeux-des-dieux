const { getGame, updateGameData, createGame } = require('./gameManager');
const { generateDeck, drawInitialCards } = require('./deck');
const WebSocket = require('ws'); // Импортируем WebSocket

async function handleWebSocketConnection(ws, wss) {
  let gameId;
  let userID;

  ws.on('message', async (message) => {
    try {
      const { type, room, userId } = JSON.parse(message);
      gameId = room;
      userID = userId;
      ws.room = room;
      ws.userID = userId; // Привязываем userID к ws объекту

      if (type === 'join') {
        await joinGame(gameId, userId, ws, wss);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
      ws.close();
    }
  });

  ws.on('close', async () => {
    await handleClose(gameId, userID, wss);  // передаем `wss` как параметр
  });
}

async function joinGame(gameId, userId, ws, wss) {
  console.log('before getGame:', gameId);
  try {
    let gameData = getGame(gameId);
    if (!gameData) {
      const deck = generateDeck();
      gameData = createGame(gameId, userId, deck);
      updateGameData(gameId, gameData); // Сохранение игры в базе данных
      ws.send(JSON.stringify({ type: 'joined', room: gameId }));
    } else {
      const existingPlayer = gameData.players.find(player => player.id === userId);

      if (existingPlayer) {
        ws.send(JSON.stringify({ type: 'rejoined', room: gameId, hand: existingPlayer.hand, table: gameData.players.map(p => ({ id: p.id, table: p.table })) }));
        if (gameData.started) {
          ws.send(JSON.stringify({ type: 'start', room: gameId, hand: existingPlayer.hand, table: gameData.players.map(p => ({ id: p.id, table: p.table })) }));
        }
      } else if (gameData.players.length < 2) {
        const newPlayer = { id: userId, hand: drawInitialCards(gameData.deck), table: [], curses: {} };
        gameData.players.push(newPlayer);

        if (gameData.players.length === 2) {
          gameData.started = true;
          startGame(gameData, wss); // Запуск игры для всех игроков
        }

        updateGameData(gameId, gameData);

        ws.send(JSON.stringify({ type: 'joined', room: gameId }));
      } else {
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

function startGame(gameData, wss) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.room === gameData.id) {  // Используем WebSocket.OPEN для проверки состояния
      const player = gameData.players.find(p => p.id === client.userID);
      if (player) {  // Добавляем проверку на наличие игрока
        client.send(JSON.stringify({
          type: 'start',
          room: gameData.id,
          hand: player.hand,
          table: gameData.players.map(p => ({ id: p.id, table: p.table }))
        }));
      } else {
        console.error(`Player not found for userID: ${client.userID}`);
      }
    }
  });
}

async function handleClose(gameId, userID, wss) {  // принимаем `wss` как параметр
  if (gameId && userID) {
    try {
      console.log('before getGame:', gameId);
      const gameData = getGame(gameId);
      if (!gameData) return;

      const updatedPlayers = gameData.players.filter(player => player.id !== userID);
      updateGameData(gameId, { ...gameData, players: updatedPlayers });

      if (updatedPlayers.length < 2) {
        updateGameData(gameId, { ...gameData, started: false });
        wss.clients.forEach((client) => {  // Используем `wss` для рассылки сообщений всем клиентам
          if (client.readyState === WebSocket.OPEN && client.room === gameId) {  // Используем WebSocket.OPEN для проверки состояния
            client.send(JSON.stringify({ type: 'waiting', room: gameId }));
          }
        });
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }
}

module.exports = {
  handleWebSocketConnection,
};
