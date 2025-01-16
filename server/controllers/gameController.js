const WebSocket = require('ws');
const {
  joinGame,
  handleClose,
  startGame,
  drawCard,
  playCard,
  playCurseCard,
  playPurificationCard,
  discardCard,
  checkForGameEnd,
} = require('../services/gameService');
const { getGame } = require('../model/gameModel');

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
        case 'join': {
          const result = await joinGame(gameId, userId);
          if (result.status === 'joined') {
            ws.send(JSON.stringify({ type: 'joined', room: gameId }));
            if (result.gameData && result.gameData.players.length === 2) {
              sendStartToAll(result.gameData, wss);
            }
          } else if (result.status === 'rejoined') {
            const existingPlayer = result.existingPlayer;
            ws.send(
              JSON.stringify({
                type: 'rejoined',
                room: gameId,
                hand: existingPlayer.hand,
                players: result.gameData.players,
                deck: result.gameData.deck,
                discardPile: result.gameData.discardPile,
                currentPlayer: result.gameData.currentPlayer,
                turn: result.gameData.turn,
              })
            );
          } else if (result.status === 'full') {
            ws.send(JSON.stringify({ type: 'full', room: gameId }));
            ws.close();
          }
          break;
        }

        case 'leave': {
          const res = await handleClose(gameId, userId);
          if (res.status === 'gameDeleted') {
          } else if (res.status === 'waiting' && res.gameData) {
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
          break;
        }

        case 'drawCard': {
          const gameData = drawCard(gameId, userId);
          if (gameData) {
            sendGameStateToAll(gameId, wss);
          }
          break;
        }

        case 'playCard': {
          const gameData = playCard(gameId, userId, card, slotIndex);
          if (gameData) {
            const ended = checkForGameEnd(gameData);
            if (ended) {
              sendGameOverToAll(gameId, wss);
            } else {
              sendGameStateToAll(gameId, wss);
            }
          }
          break;
        }

        case 'playCurseCard': {
          const gameData = playCurseCard(gameId, userId, card, slotIndex, targetPlayerId);
          if (gameData) {
            const ended = checkForGameEnd(gameData);
            if (ended) {
              sendGameOverToAll(gameId, wss);
            } else {
              sendGameStateToAll(gameId, wss);
            }
          }
          break;
        }

        case 'playPurificationCard': {
          const gameData = playPurificationCard(gameId, userId, card, slotIndex);
          if (gameData) {
            const ended = checkForGameEnd(gameData);
            if (ended) {
              sendGameOverToAll(gameId, wss);
            } else {
              sendGameStateToAll(gameId, wss);
            }
          }
          break;
        }

        case 'discardCard': {
          const gameData = discardCard(gameId, userId, card);
          if (gameData) {
            const ended = checkForGameEnd(gameData);
            if (ended) {
              sendGameOverToAll(gameId, wss);
            } else {
              sendGameStateToAll(gameId, wss);
            }
          }
          break;
        }

        default:
          break;
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
    await handleClose(gameId, userID);
  });
}

function sendStartToAll(gameData, wss) {
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
      }
    }
  });
}

function sendGameStateToAll(gameId, wss) {
  const gameData = getGame(gameId);
  if (!gameData) return;

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

function sendGameOverToAll(gameId, wss) {
  const gameData = getGame(gameId);
  if (!gameData) return;

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

module.exports = {
  handleWebSocketConnection,
};