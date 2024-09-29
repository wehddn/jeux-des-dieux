const { getGame, updateGameData, createGame, deleteGame, updatePlayersInFirestore, deleteGameFromFirestore, updateGameInFirestore } = require('./gameManager');
const { generateDeck, drawInitialCards } = require('./deck');
const WebSocket = require('ws');

let processing = {};

async function handleWebSocketConnection(ws, wss) {
  let gameId;
  let userID;

  ws.on('message', async (message) => {
    try {
      const { type, room, userId } = JSON.parse(message);
      gameId = room;
      userID = userId;
      ws.room = room;
      ws.userID = userId;

      switch (type) {
        case 'join':
          console.log(`User ${userId} is attempting to join room ${room}`);
          await joinGame(gameId, userId, ws, wss);
          break;
        case 'leave':
          console.log(`User ${userId} is leaving room ${room}`);
          await handleClose(gameId, userId, wss);
          break;
        case 'drawCard':
          console.log(`Player ${userId} is drawing a card`);
          await handleDrawCard(gameId, userId, ws, wss);
          break;
        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
      ws.close();
    }
  });

  ws.on('close', async () => {
    console.log(`Connection closed for user ${userID} in room ${gameId}`);
    await handleClose(gameId, userID, wss);
  });
}
// Присоединение к игре
async function joinGame(gameId, userId, ws, wss) {
  console.log('Attempting to join game:', gameId);
  try {
    let gameData = getGame(gameId);
    if (!gameData) {
      // Создаем новую игру
      gameData = createGame(gameId, userId);
      updateGameData(gameId, gameData);
      await updatePlayersInFirestore(gameId, gameData.players);
      ws.send(JSON.stringify({ type: 'joined', room: gameId }));
      console.log(`User ${userId} created and joined new game ${gameId}`);
    } else {
      const existingPlayer = gameData.players.find(player => player.id === userId);

      if (existingPlayer) {
        // Игрок повторно присоединился к существующей игре
        console.log(`User ${userId} rejoined existing game ${gameId}`);
        ws.send(JSON.stringify({ type: 'rejoined', room: gameId, hand: existingPlayer.hand, table: gameData.players.map(p => ({ id: p.id, table: p.table })) }));
      } else if (gameData.players.length < 2) {
        // Добавляем второго игрока
        const newPlayer = { id: userId, hand: [], table: [] };
        gameData.players.push(newPlayer);
        console.log(`User ${userId} joined game ${gameId}, current players: ${gameData.players.map(p => p.id).join(', ')}`);

        // Если оба игрока присоединились, начинаем игру
        if (gameData.players.length === 2) {
          gameData.started = true;
          gameData.currentPlayer = 0;  // Начинает первый игрок
          startGame(gameData, wss);  // Вызываем startGame
        }

        updateGameData(gameId, gameData);
        await updatePlayersInFirestore(gameId, gameData.players);
        ws.send(JSON.stringify({ type: 'joined', room: gameId }));
      } else {
        console.log(`User ${userId} could not join game ${gameId} because it is full`);
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

async function handleClose(gameId, userID, wss) {
  if (gameId && userID) {
    try {
      if (processing[gameId]) {
        console.log(`Processing already in progress for game ${gameId}`);
        return;
      }
      processing[gameId] = true;

      const gameData = getGame(gameId);
      if (!gameData) {
        console.log(`Game data not found for gameId: ${gameId}`);
        processing[gameId] = false;
        return;
      }

      const updatedPlayers = gameData.players.filter(player => player.id !== userID);

      if (updatedPlayers.length === 0) {
        console.log(`No players left in game ${gameId}. Deleting game.`);
        deleteGame(gameId);
        await deleteGameFromFirestore(gameId);
      } else {
        updateGameData(gameId, { ...gameData, players: updatedPlayers, started: false });
        await updatePlayersInFirestore(gameId, updatedPlayers);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.room === gameId) {
            client.send(JSON.stringify({ type: 'waiting', room: gameId }));
          }
        });
      }

      //console.log(`Updated players after ${userID} left:`, updatedPlayers);
      console.log(`Updated players after ${userID} left`);
      processing[gameId] = false;
    } catch (error) {
      console.error('Error handling disconnect:', error);
      processing[gameId] = false;
    }
  }
}

function startGame(gameData, wss) {
  console.log(`Starting game ${gameData.id}`);

  gameData.started = true;

  // Раздаем карты игрокам
  gameData.players.forEach(player => {
    player.hand = drawInitialCards(gameData.deck);
    player.table = [];
  });

  updateGameData(gameData.id, gameData);

  // Отправляем данные всем подключенным клиентам
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.room === gameData.id) {
      const player = gameData.players.find(p => p.id === client.userID);
      if (player) {
        client.send(JSON.stringify({
          type: 'start',
          room: gameData.id,
          hand: player.hand,
          table: gameData.players.map(p => ({ id: p.id, table: p.table })),
          deck: gameData.deck,  // Отправляем состояние колоды
          currentPlayer: gameData.currentPlayer
        }));
        console.log(`Sent start game message to user ${client.userID}`);
      } else {
        console.error(`Player not found for userID: ${client.userID} in game ${gameData.id}`);
      }
    }
  });
}

async function handleDrawCard(gameId, userId, ws, wss) {
  const gameData = getGame(gameId);
  const player = gameData.players.find(p => p.id === userId);

  if (player && gameData.deck.length > 0 && gameData.currentPlayer === gameData.players.indexOf(player)) {
    const newCard = gameData.deck.pop();
    player.hand.push(newCard);
    console.log(`Player ${userId} drew a card:`, newCard);

    updateGameData(gameId, gameData);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.room === gameId) {
        const playerState = gameData.players.map(p => ({ id: p.id, table: p.table }));
        client.send(JSON.stringify({
          type: 'gameState',
          deck: gameData.deck,
          room: gameId,
          hand: client.userID === userId ? player.hand : [],
          table: playerState,
          currentPlayer: gameData.currentPlayer  // Отправляем текущего игрока
        }));
      }
    });
  }
}

module.exports = {
  handleWebSocketConnection,
};