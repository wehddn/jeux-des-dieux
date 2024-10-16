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

const server = app.listen(port, () => {});

const wss = new WebSocket.Server({ server });

console.log(`Server running on port ${port}`);

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
        targetPlayerId,
      } = JSON.parse(message);
      gameId = room;
      userID = userId;
      ws.room = room;
      ws.userID = userId;

      switch (type) {
        case 'join':
          console.log('Joining game:', room, userId);
          await joinGame(gameId, userId, ws, wss);
          break;
        case 'leave':
          await handleClose(gameId, userId, wss);
          break;
        case 'drawCard':
          await handleDrawCard(gameId, userId, wss);
          break;
        case 'playCard':
          await handlePlayCard(
            gameId, userId, card, slotIndex, wss
          );
          break;
        case 'playCurseCard':
          await handlePlayCurseCard(gameId, userId, card, slotIndex, targetPlayerId, wss);
          break;
        case 'playPurificationCard':
          await handlePlayPurificationCard(gameId, userId, card, slotIndex, wss);
          break;
        case 'discardCard':
          await handleDiscardCard(
            gameId, userId, card, wss
          );
          break;
        default:
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
    await handleClose(gameId, userID, wss);
  });
}

async function joinGame(gameId, userId, ws, wss) {
  try {
    let gameData = getGame(gameId);
    if (!gameData) {
      gameData = createGame(gameId, userId);
      updateGameData(gameId, gameData);
      await updatePlayersInFirestore(
        gameId, gameData.players
      );
      ws.send(
        JSON.stringify({ type: 'joined', room: gameId })
      );
    } else {
      const existingPlayer = gameData.players.find(
        (player) => player.id === userId
      );

      if (existingPlayer) {
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
        const newPlayer = {
          id: userId,
          hand: [],
          table: [],
        };
        gameData.players.push(newPlayer);
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

async function handleClose(gameId, userID, wss) {
  if (gameId && userID) {
    try {
      if (processing[gameId]) {
        return;
      }
      processing[gameId] = true;

      const gameData = getGame(gameId);
      if (!gameData) {
        processing[gameId] = false;
        return;
      }

      const updatedPlayers = gameData.players.filter(
        (player) => player.id !== userID
      );

      if (updatedPlayers.length === 0) {
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

      processing[gameId] = false;
    } catch (error) {
      console.error('Error handling disconnect:', error);
      processing[gameId] = false;
    }
  }
}

function startGame(gameData, wss) {

  gameData.started = true;
  gameData.deck = generateDeck();
  gameData.discardPile = [];
  gameData.turn = 0;

  gameData.players.forEach((player) => {
    player.hand = drawInitialCards(gameData.deck);
    player.table = [];
  });

  updateGameData(gameData.id, gameData);

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
      } else {
        console.error(
          `Player not found for userID: ${client.userID} in game ${gameData.id}`
        );
      }
    }
  });
}

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

    gameData.turn += 1;
    updateGameData(gameId, gameData);

    sendGameStateToAll(gameId, wss);
  }
}

async function handlePlayCard(
  gameId, userId, card, slotIndex, wss
) {
  const gameData = getGame(gameId);
  const player = gameData.players.find((p) => p.id === userId);

  if (
    player &&
    gameData.currentPlayer === gameData.players.indexOf(player)
  ) {
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
      return;
    }

    player.table.push({ ...card, slot: slotIndex });

    const index = player.hand.findIndex(
      (c) => c.suit === card.suit && c.value === card.value
    );
    
    if (index !== -1) {
      player.hand.splice(index, 1);
    }

    if (gameData.deck.length > 0) {
      const newCard = gameData.deck.pop();
      player.hand.push(newCard);
    } else {
      console.log('Deck is empty, no card drawn');
    }

    gameData.currentPlayer = (
      gameData.currentPlayer + 1
    ) % gameData.players.length;
    gameData.turn += 1;

    updateGameData(gameId, gameData);

    const gameEnded = checkForGameEnd(gameData);

    if (gameEnded) {
      sendGameOverToAll(gameId, wss);
    } else {
      sendGameStateToAll(gameId, wss);
    }
  } else {
    console.error(
      `Player ${userId} is not the current player or not found in game ${gameId}`
    );
  }
}

async function handlePlayCurseCard(gameId, userId, card, slotIndex, targetPlayerId, wss) {
  const gameData = getGame(gameId);
  const player = gameData.players.find((p) => p.id === userId);
  const targetPlayer = gameData.players.find((p) => p.id === targetPlayerId);

  if (
    player &&
    targetPlayer &&
    gameData.currentPlayer === gameData.players.indexOf(player)
  ) {
    const slotSuits = [
      'Crèdes',
      'Ordre de la Vérité',
      'Capères',
      'Phagots',
    ];
    const slotSuit = slotSuits[slotIndex];

    const slotHasCards = targetPlayer.table.some(c => c.slot === slotIndex);
    if (!slotHasCards) {
      return;
    }

    if (
      card.suit !== slotSuit &&
      card.suit !== 'Mercenaires'
    ) {
      return;
    }

    const purificationsInSlot = targetPlayer.table.filter(
      (c) => c.slot === slotIndex && c.isPurification
    );

    if (purificationsInSlot.length > 0) {
      const purificationToRemove = purificationsInSlot[0];
      targetPlayer.table.splice(targetPlayer.table.indexOf(purificationToRemove), 1);
    } else {
      targetPlayer.table.push({ ...card, slot: slotIndex, isCurse: true });

      const curseCardsInSlot = targetPlayer.table.filter(
        (c) => c.slot === slotIndex && c.isCurse
      );

      if (curseCardsInSlot.length >= 2) {
        targetPlayer.table = targetPlayer.table.filter(
          (c) => !(c.slot === slotIndex && c.isCurse)
        );

        const normalCardsInSlot = targetPlayer.table.filter(
          (c) => c.slot === slotIndex && !c.isCurse && !c.isPurification
        );

        if (normalCardsInSlot.length > 0) {
          const cardToRemove = normalCardsInSlot[0];
          targetPlayer.table.splice(targetPlayer.table.indexOf(cardToRemove), 1);
        }
      }
    }

    const index = player.hand.findIndex(
      (c) => c.suit === card.suit && c.value === card.value
    );
    
    if (index !== -1) {
      player.hand.splice(index, 1);
    }

    if (gameData.deck.length > 0) {
      const newCard = gameData.deck.pop();
      player.hand.push(newCard);
    } else {
      console.log('Deck is empty, no card drawn');
    }

    gameData.currentPlayer = (
      gameData.currentPlayer + 1
    ) % gameData.players.length;
    gameData.turn += 1;

    updateGameData(gameId, gameData);

    const gameEnded = checkForGameEnd(gameData);

    if (gameEnded) {
      sendGameOverToAll(gameId, wss);
    } else {
      sendGameStateToAll(gameId, wss);
    }
  } else {
    console.error(
      `Player ${userId} is not the current player or not found in game ${gameId}`
    );
  }
}


async function handlePlayPurificationCard(gameId, userId, card, slotIndex, wss) {
  const gameData = getGame(gameId);
  const player = gameData.players.find((p) => p.id === userId);

  if (
    player &&
    gameData.currentPlayer === gameData.players.indexOf(player)
  ) {
    const slotHasCards = player.table.some(c => c.slot === slotIndex);
    if (!slotHasCards) {
      return;
    }

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
      return;
    }

    const cursesInSlot = player.table.filter(
      (c) => c.slot === slotIndex && c.isCurse
    );

    if (cursesInSlot.length > 0) {
      const curseToRemove = cursesInSlot[0];
      player.table.splice(player.table.indexOf(curseToRemove), 1);
    } else {
      player.table.push({ ...card, slot: slotIndex, isPurification: true });
    }

    const index = player.hand.findIndex(
      (c) => c.suit === card.suit && c.value === card.value
    );
    
    if (index !== -1) {
      player.hand.splice(index, 1);
    }

    if (gameData.deck.length > 0) {
      const newCard = gameData.deck.pop();
      player.hand.push(newCard);
    } else {
      console.log('Deck is empty, no card drawn');
    }

    gameData.currentPlayer = (
      gameData.currentPlayer + 1
    ) % gameData.players.length;
    gameData.turn += 1;

    updateGameData(gameId, gameData);

    const gameEnded = checkForGameEnd(gameData);

    if (gameEnded) {
      sendGameOverToAll(gameId, wss);
    } else {
      sendGameStateToAll(gameId, wss);
    }
  } else {
    console.error(
      `Player ${userId} is not the current player or not found in game ${gameId}`
    );
  }
}



async function handleDiscardCard(
  gameId, userId, card, wss
) {
  const gameData = getGame(gameId);
  const player = gameData.players.find((p) => p.id === userId);

  if (
    player &&
    gameData.currentPlayer === gameData.players.indexOf(player)
  ) {
    const index = player.hand.findIndex(
      (c) => c.suit === card.suit && c.value === card.value
    );
    
    if (index !== -1) {
      player.hand.splice(index, 1);
    }

    gameData.discardPile.push(card);

    if (gameData.deck.length > 0) {
      const newCard = gameData.deck.pop();
      player.hand.push(newCard);
    } else {
      console.log('Deck is empty, no card drawn');
    }

    gameData.currentPlayer = (
      gameData.currentPlayer + 1
    ) % gameData.players.length;
    gameData.turn += 1;

    updateGameData(gameId, gameData);

    const gameEnded = checkForGameEnd(gameData);

    if (gameEnded) {
      sendGameOverToAll(gameId, wss);
    } else {
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

  for (const player of gameData.players) {
    const slotCounts = {};

    for (const card of player.table) {
      const slot = card.slot;
      if (!card.isCurse && card.value != "9") {
        slotCounts[slot] = (slotCounts[slot] || 0) + 1;
      }
    }

    for (const slot in slotCounts) {
      if (slotCounts[slot] >= 4) {
        const hasCurseCards = player.table.some(
          (c) => c.slot == slot && c.isCurse
        );
        if (!hasCurseCards) {
          winnerId = player.id;
          break;
        }
      }
    }

    if (winnerId) {
      break;
    }
  }

  if (!winnerId) {
    const allHandsEmpty = gameData.players.every(player => player.hand.length === 0);
    if (allHandsEmpty) {
      isDraw = true;
    }
  }

  if (winnerId || isDraw) {
    gameData.isGameOver = true;
    gameData.winnerId = winnerId;
    gameData.isDraw = isDraw;

    return true;
  }

  return false;
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
          winnerId: gameData.winnerId,
          isDraw: gameData.isDraw,
        })
      );
    }
  });
}