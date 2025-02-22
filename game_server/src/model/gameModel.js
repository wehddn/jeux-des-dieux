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
      throw new Error("Error updating players in DB");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updatePlayersInDB:", error);
    throw new Error("API error");
  }
}

async function deleteGameFromDB(gameId) {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error deleting game from DB");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in deleteGameFromDB:", error);
    throw new Error("API error");
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
      throw new Error("Error updating game in DB");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateGameInDB:", error);
    throw new Error("API error");
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