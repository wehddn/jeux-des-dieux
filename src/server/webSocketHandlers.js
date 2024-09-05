// webSocketHandlers.js
const { getGame, updateGameData, createGame, deleteGame, updatePlayersInFirestore, deleteGameFromFirestore } = require('./gameManager');
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

      if (type === 'join') {
        console.log(`User ${userId} is attempting to join room ${room}`);
        await joinGame(gameId, userId, ws, wss);
      } else if (type === 'leave') {
        console.log(`User ${userId} is leaving room ${room}`);
        await handleClose(gameId, userID, wss);
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

async function joinGame(gameId, userId, ws, wss) {
  console.log('Attempting to join game:', gameId);
  try {
    let gameData = getGame(gameId);
    if (!gameData) {
      const deck = generateDeck();
      gameData = createGame(gameId, userId, deck);
      updateGameData(gameId, gameData);
      await updatePlayersInFirestore(gameId, gameData.players);
      ws.send(JSON.stringify({ type: 'joined', room: gameId }));
      console.log(`User ${userId} created and joined new game ${gameId}`);
    } else {
      const existingPlayer = gameData.players.find(player => player.id === userId);

      if (existingPlayer) {
        console.log(`User ${userId} rejoined existing game ${gameId}`);
        ws.send(JSON.stringify({ type: 'rejoined', room: gameId }));
      } else if (gameData.players.length < 2) {
        const newPlayer = { id: userId };
        gameData.players.push(newPlayer);
        console.log(`User ${userId} joined game ${gameId}, current players: ${gameData.players.map(p => p.id).join(', ')}`);

        if (gameData.players.length === 2) {
          gameData.started = true;
          startGame(gameData, wss);
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

      console.log(`Updated players after ${userID} left:`, updatedPlayers);
      processing[gameId] = false;
    } catch (error) {
      console.error('Error handling disconnect:', error);
      processing[gameId] = false;
    }
  }
}

function startGame(gameData, wss) {
  console.log(`Starting game ${gameData.id}`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.room === gameData.id) {
      client.send(JSON.stringify({
        type: 'start',
        room: gameData.id
      }));
      console.log(`Sent start game message to user ${client.userID}`);
    }
  });
}

module.exports = {
  handleWebSocketConnection,
};
