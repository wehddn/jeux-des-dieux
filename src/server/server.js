const express = require('express');
const WebSocket = require('ws');
const {
  getGame,
  updateGameData,
  createGame,
  deleteGame,
  updatePlayersInFirestore,
  deleteGameFromFirestore,
  updateGameInFirestore,
} = require('./gameManager');
const { generateDeck, drawInitialCards } = require('./deck');

let processing = {};

const app = express();
const port = 3001;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  handleWebSocketConnection(ws, wss);
});

async function handleWebSocketConnection(ws, wss) {
  let gameId;
  let userID;

  ws.on('message', async (message) => {
    try {
      const {
        type,
        room,
        userId,
        card,
        slotIndex,
      } = JSON.parse(message);
      gameId = room;
      userID = userId;
      ws.room = room;
      ws.userID = userId;

      switch (type) {
        case 'join':
          console.log(
            `User ${userId} is attempting to join room ${room}`
          );
          await joinGame(gameId, userId, ws, wss);
          break;
        case 'leave':
          console.log(
            `User ${userId} is leaving room ${room}`
          );
          await handleClose(gameId, userId, wss);
          break;
        case 'drawCard':
          console.log(
            `Player ${userId} is drawing a card`
          );
          await handleDrawCard(gameId, userId, wss);
          break;
        case 'playCard':
          console.log(
            `Player ${userId} is playing a card`
          );
          await handlePlayCard(
            gameId, userId, card, slotIndex, wss
          );
          break;
        case 'discardCard':
          console.log(
            `Player ${userId} is discarding a card`
          );
          await handleDiscardCard(
            gameId, userId, card, wss
          );
          break;
        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Internal server error',
        })
      );
      ws.close();
    }
  });

  ws.on('close', async () => {
    console.log(
      `Connection closed for user ${userID} in room ${gameId}`
    );
    await handleClose(gameId, userID, wss);
  });
}

// Присоединение к игре
async function joinGame(gameId, userId, ws, wss) {
  console.log('Attempting to join game:', gameId);
  try {
    let gameData = getGame(gameId);
    if (!gameData) {
      // Создаём новую игру
      gameData = createGame(gameId, userId);
      updateGameData(gameId, gameData);
      await updatePlayersInFirestore(
        gameId, gameData.players
      );
      ws.send(
        JSON.stringify({ type: 'joined', room: gameId })
      );
      console.log(
        `User ${userId} created and joined new game ${gameId}`
      );
    } else {
      const existingPlayer = gameData.players.find(
        (player) => player.id === userId
      );

      if (existingPlayer) {
        // Игрок повторно присоединился
        console.log(
          `User ${userId} rejoined existing game ${gameId}`
        );
        ws.send(
          JSON.stringify({
            type: 'rejoined',
            room: gameId,
            hand: existingPlayer.hand,
            players: gameData.players,
            deck: gameData.deck,
            discardPile: gameData.discardPile,
            currentPlayer: gameData.currentPlayer,
            turn: gameData.turn,
          })
        );
      } else if (gameData.players.length < 2) {
        // Добавляем нового игрока
        const newPlayer = {
          id: userId,
          hand: [],
          table: [],
        };
        gameData.players.push(newPlayer);
        console.log(
          `User ${userId} joined game ${gameId}, current players: ${gameData.players.map(p => p.id).join(', ')}`
        );

        // Начинаем игру, если два игрока присоединились
        if (gameData.players.length === 2) {
          gameData.started = true;
          gameData.currentPlayer = 0;
          startGame(gameData, wss);
        }

        updateGameData(gameId, gameData);
        await updatePlayersInFirestore(
          gameId, gameData.players
        );
        ws.send(
          JSON.stringify({ type: 'joined', room: gameId })
        );
      } else {
        console.log(
          `User ${userId} could not join game ${gameId} because it is full`
        );
        ws.send(
          JSON.stringify({ type: 'full', room: gameId })
        );
        ws.close();
      }
    }
  } catch (error) {
    console.error('Error joining game:', error);
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'Internal server error',
      })
    );
    ws.close();
  }
}

// Закрытие соединения
async function handleClose(gameId, userID, wss) {
  if (gameId && userID) {
    try {
      if (processing[gameId]) {
        console.log(
          `Processing already in progress for game ${gameId}`
        );
        return;
      }
      processing[gameId] = true;

      const gameData = getGame(gameId);
      if (!gameData) {
        console.log(
          `Game data not found for gameId: ${gameId}`
        );
        processing[gameId] = false;
        return;
      }

      const updatedPlayers = gameData.players.filter(
        (player) => player.id !== userID
      );

      if (updatedPlayers.length === 0) {
        console.log(
          `No players left in game ${gameId}. Deleting game.`
        );
        deleteGame(gameId);
        await deleteGameFromFirestore(gameId);
      } else {
        updateGameData(gameId, {
          ...gameData,
          players: updatedPlayers,
          started: false,
        });
        await updatePlayersInFirestore(
          gameId, updatedPlayers
        );

        wss.clients.forEach((client) => {
          if (
            client.readyState === WebSocket.OPEN &&
            client.room === gameId
          ) {
            client.send(
              JSON.stringify({
                type: 'waiting',
                room: gameId,
              })
            );
          }
        });
      }

      console.log(`Updated players after ${userID} left`);
      processing[gameId] = false;
    } catch (error) {
      console.error('Error handling disconnect:', error);
      processing[gameId] = false;
    }
  }
}

// Начало игры
function startGame(gameData, wss) {
  console.log(`Starting game ${gameData.id}`);

  gameData.started = true;
  gameData.deck = generateDeck(); // Генерируем колоду
  gameData.discardPile = [];
  gameData.turn = 0;

  // Раздаём начальные карты игрокам
  gameData.players.forEach((player) => {
    player.hand = drawInitialCards(gameData.deck);
    player.table = [];
  });

  updateGameData(gameData.id, gameData);

  // Отправляем данные всем подключенным клиентам
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.room === gameData.id
    ) {
      const player = gameData.players.find(
        (p) => p.id === client.userID
      );
      if (player) {
        client.send(
          JSON.stringify({
            type: 'start',
            room: gameData.id,
            hand: player.hand,
            players: gameData.players.map((p) => ({
              id: p.id,
              table: p.table,
            })),
            deck: gameData.deck,
            currentPlayer: gameData.currentPlayer,
            discardPile: gameData.discardPile,
            turn: gameData.turn,
          })
        );
        console.log(
          `Sent start game message to user ${client.userID}`
        );
      } else {
        console.error(
          `Player not found for userID: ${client.userID} in game ${gameData.id}`
        );
      }
    }
  });
}

// Отправка состояния игры всем игрокам
function sendGameStateToAll(gameId, wss) {
  const gameData = getGame(gameId);

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.room === gameId
    ) {
      const clientPlayer = gameData.players.find(
        (p) => p.id === client.userID
      );
      client.send(
        JSON.stringify({
          type: 'gameState',
          deck: gameData.deck,
          room: gameId,
          hand: clientPlayer ? clientPlayer.hand : [],
          players: gameData.players.map((p) => ({
            id: p.id,
            table: p.table,
          })),
          discardPile: gameData.discardPile,
          currentPlayer: gameData.currentPlayer,
          turn: gameData.turn,
        })
      );
    }
  });
}

// Обработка взятия карты
async function handleDrawCard(gameId, userId, wss) {
  const gameData = getGame(gameId);
  const player = gameData.players.find((p) => p.id === userId);

  if (
    player &&
    gameData.deck.length > 0 &&
    gameData.currentPlayer === gameData.players.indexOf(player)
  ) {
    const newCard = gameData.deck.pop();
    player.hand.push(newCard);
    console.log(`Player ${userId} drew a card:`, newCard);

    // Обновляем состояние игры
    gameData.turn += 1;
    updateGameData(gameId, gameData);

    // Отправляем обновлённое состояние всем игрокам
    sendGameStateToAll(gameId, wss);
  }
}

// Обработка розыгрыша карты
async function handlePlayCard(
  gameId, userId, card, slotIndex, wss
) {
  const gameData = getGame(gameId);
  const player = gameData.players.find((p) => p.id === userId);

  if (
    player &&
    gameData.currentPlayer === gameData.players.indexOf(player)
  ) {
    // Проверяем, может ли карта быть сыграна в указанный слот
    const slotSuits = [
      'Crèdes',
      'Ordre de la Vérité',
      'Capères',
      'Phagots',
    ];
    const slotSuit = slotSuits[slotIndex];
    if (
      card.suit !== slotSuit &&
      card.suit !== 'Mercenaires'
    ) {
      console.log(
        `Player ${userId} cannot play card ${card.suit} on slot ${slotIndex}`
      );
      return;
    }

    // Добавляем карту на стол игрока
    player.table.push({ ...card, slot: slotIndex });

    // Удаляем карту из руки игрока
    player.hand = player.hand.filter(
      (c) => c.suit !== card.suit || c.value !== card.value
    );

    // Добавляем новую карту из колоды
    if (gameData.deck.length > 0) {
      const newCard = gameData.deck.pop();
      player.hand.push(newCard);
      console.log(
        `Player ${userId} drew a new card:`, newCard
      );
    } else {
      console.log('Deck is empty, no card drawn');
    }

    // Переход хода к следующему игроку
    gameData.currentPlayer = (
      gameData.currentPlayer + 1
    ) % gameData.players.length;
    gameData.turn += 1;

    // Обновляем состояние игры
    updateGameData(gameId, gameData);

    const gameEnded = checkForGameEnd(gameData);

    if (gameEnded) {
      // Отправляем сообщение об окончании игры всем игрокам
      sendGameOverToAll(gameId, wss);
    } else {
      // Если игра не закончилась, отправляем обновлённое состояние
      sendGameStateToAll(gameId, wss);
    }
  } else {
    console.error(
      `Player ${userId} is not the current player or not found in game ${gameId}`
    );
  }
}

// Обработка сброса карты
async function handleDiscardCard(
  gameId, userId, card, wss
) {
  const gameData = getGame(gameId);
  const player = gameData.players.find((p) => p.id === userId);

  if (
    player &&
    gameData.currentPlayer === gameData.players.indexOf(player)
  ) {
    // Удаляем карту из руки игрока
    player.hand = player.hand.filter(
      (c) => c.suit !== card.suit || c.value !== card.value
    );

    // Добавляем карту в сброс
    gameData.discardPile.push(card);

    console.log(`Player ${userId} discarded a card:`, card);

    // Добавляем новую карту из колоды
    if (gameData.deck.length > 0) {
      const newCard = gameData.deck.pop();
      player.hand.push(newCard);
      console.log(
        `Player ${userId} drew a new card:`, newCard
      );
    } else {
      console.log('Deck is empty, no card drawn');
    }

    // Переход хода к следующему игроку
    gameData.currentPlayer = (
      gameData.currentPlayer + 1
    ) % gameData.players.length;
    gameData.turn += 1;

    // Обновляем состояние игры
    updateGameData(gameId, gameData);

    const gameEnded = checkForGameEnd(gameData);

    if (gameEnded) {
      // Отправляем сообщение об окончании игры всем игрокам
      sendGameOverToAll(gameId, wss);
    } else {
      // Если игра не закончилась, отправляем обновлённое состояние
      sendGameStateToAll(gameId, wss);
    }
  } else {
    console.error(
      `Player ${userId} is not the current player or not found in game ${gameId}`
    );
  }
}

function checkForGameEnd(gameData) {
  let winnerId = null;
  let isDraw = false;

  // Проверяем, собрал ли кто-то 4 карты в одном слоте
  for (const player of gameData.players) {
    const slotCounts = {};

    for (const card of player.table) {
      const slot = card.slot;
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;

      if (slotCounts[slot] >= 4) {
        winnerId = player.id;
        break;
      }
    }

    if (winnerId) {
      break;
    }
  }

  // Если победитель не найден, проверяем на ничью
  if (!winnerId) {
    const allHandsEmpty = gameData.players.every(player => player.hand.length === 0);
    if (allHandsEmpty) {
      isDraw = true;
    }
  }

  // Если игра закончилась, устанавливаем флаги и возвращаем true
  if (winnerId || isDraw) {
    gameData.isGameOver = true;
    gameData.winnerId = winnerId;
    gameData.isDraw = isDraw;

    // Для тестирования выводим в консоль
    if (winnerId) {
      console.log(`Player ${winnerId} has won the game!`);
    } else if (isDraw) {
      console.log('The game ended in a draw.');
    }

    return true; // Игра закончилась
  }

  return false; // Игра продолжается
}

function sendGameOverToAll(gameId, wss) {
  const gameData = getGame(gameId);

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.room === gameId
    ) {
      client.send(
        JSON.stringify({
          type: 'gameOver',
          winnerId: gameData.winnerId, // ID победителя или null
          isDraw: gameData.isDraw,     // true, если ничья
        })
      );
    }
  });
}