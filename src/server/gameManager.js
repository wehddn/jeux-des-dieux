const { db } = require('./firebaseConfig');
const { generateDeck } = require('./deck');
const games = {};

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

async function updatePlayersInFirestore(gameId, players) {
  try {
    const filteredPlayers = players.map(player => ({ id: player.id }));
    await db.collection('Games').doc(gameId).update({ players: filteredPlayers });
  } catch (error) {
    console.error('Error updating players in Firestore:', error);
  }
}

async function deleteGameFromFirestore(gameId) {
  try {
    await db.collection('Games').doc(gameId).delete();
  } catch (error) {
    console.error('Error deleting game from Firestore:', error);
  }
}

async function updateGameInFirestore(gameId, gameData) {
  try {
    await db.collection('Games').doc(gameId).update({ started: gameData.started });
  } catch (error) {
    console.error('Error updating game started status in Firestore:', error);
  }
}

module.exports = {
  getGame,
  updateGameData,
  createGame,
  deleteGame,
  updatePlayersInFirestore,
  deleteGameFromFirestore,
  updateGameInFirestore  
};