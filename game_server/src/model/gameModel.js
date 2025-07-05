const jwt = require('jsonwebtoken');
const { generateDeck } = require('../deck');
const path = require('path');
const games = {};

// Load .env from the game_server root directory
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const API_URL = "http://localhost:5000";

const getAuthHeaders = (additionalHeaders = {}) => {
  const payload = { 
    service: 'game_server',
    sub: 0,        // Service user ID (0 for system)
    role: 10       // High role for service-to-service communication
  };
  const secret = process.env.JWT_SECRET || "your_secret_key";
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
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
    const playerIds = players.map(player => player.id);
    console.log("headers", getAuthHeaders({ "Content-Type": "application/json" }));
    const response = await fetch(`${API_URL}/games/${gameId}/players`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ add: playerIds, remove: [] }),
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