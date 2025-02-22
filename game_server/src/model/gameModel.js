const { generateDeck } = require('../deck');
const games = {};

const API_URL = "http://localhost:5000/api";

function getGame(gameId) {
  return games[gameId];
}

function updateGameData(gameId, gameData) {
  games[gameId] = gameData;
}

function createGame(gameId, playerId) {
  const deck = generateDeck();
  const gameData = {
    id: gameId,
    deck: deck,
    players: [
      { id: playerId, hand: [], table: [] }
    ],
    discardPile: [],
    started: false,
  };
  updateGameData(gameId, gameData);
  return gameData;
}

function deleteGame(gameId) {
  delete games[gameId];
}

async function updatePlayersInDB(gameId, players) {
  try {
    const filteredPlayers = players.map(player => ({ id: player.id }));

    const response = await fetch(`${API_URL}/games/${gameId}/players`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: filteredPlayers }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при обновлении списка игроков");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка в updatePlayersInDB:", error);
    throw new Error("Ошибка работы с API");
  }
}

async function deleteGameFromDB(gameId) {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Ошибка при удалении игры");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка в deleteGameFromDB:", error);
    throw new Error("Ошибка работы с API");
  }
}

async function updateGameInDB(gameId, gameData) {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ started: gameData.started }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при обновлении статуса игры");
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка в updateGameInDB:", error);
    throw new Error("Ошибка работы с API");
  }
}

module.exports = {
  getGame,
  updateGameData,
  createGame,
  deleteGame,
  updatePlayersInDB,
  deleteGameFromDB,
  updateGameInDB  
};