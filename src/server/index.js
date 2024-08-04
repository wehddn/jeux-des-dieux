//index.js
const express = require('express');
const WebSocket = require('ws');
const { getOrCreateGame, updateGameData } = require('./Games.js');
const app = express();
const port = 3001;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  let roomID;
  let userID;

  ws.on('message', async (message) => {
    const { type, room, userId, userEmail } = JSON.parse(message);
    roomID = room;
    userID = userId;

    if (type === 'join') {
      try {
        const gameData = await getOrCreateGame(roomID, { players: [], started: false });
        if (gameData.players.length < 2) {
          // Добавляем игрока в комнату
          const newPlayers = [...gameData.players, { id: userID }];
          await updateGameData(roomID, { players: newPlayers });

          // Сообщаем игроку, что он присоединился
          ws.send(JSON.stringify({ type: 'joined', room: roomID }));

          // Начало игры, если два игрока
          if (newPlayers.length === 2) {
            await updateGameData(roomID, { started: true });
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'start', room: roomID }));
              }
            });
          }
        } else {
          // Комната заполнена
          ws.send(JSON.stringify({ type: 'full', room: roomID }));
          ws.close();
        }
      } catch (error) {
        console.error('Error handling join request:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
        ws.close();
      }
    }
  });

  ws.on('close', async () => {
    if (roomID && userID) {
      try {
        const gameData = await getOrCreateGame(roomID);
        const updatedPlayers = gameData.players.filter(player => player.id !== userID);
        await updateGameData(roomID, { players: updatedPlayers });

        if (updatedPlayers.length < 2) {
          await updateGameData(roomID, { started: false });
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'waiting', room: roomID }));
            }
          });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  });
});
