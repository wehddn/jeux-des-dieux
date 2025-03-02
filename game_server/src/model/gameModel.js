const jwt = require('jsonwebtoken');
const { generateDeck } = require('../deck');
const games = {};
require('dotenv').config();

const payload = { service: 'game_server' };

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = (additionalHeaders = {}) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET || "your_secret_key", { expiresIn: '1h' });
  return token ? { ...additionalHeaders, Authorization: `Bearer ${token}` } : additionalHeaders;
};

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
    console.log("headers", getAuthHeaders({ "Content-Type": "application/json" }));
    const response = await fetch(`${API_URL}/games/${gameId}/players`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ players: filteredPlayers }),
    });

    if (!response.ok) {
      console.error("Error updating players in DB response:", response);
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
      headers: getAuthHeaders()
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
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
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