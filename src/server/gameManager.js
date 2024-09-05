// gameManager.js
const { db } = require('./firebaseConfig'); 
const games = {}; // Местное хранилище для управления состоянием игры

function getGame(gameId) {
  return games[gameId];
}

function updateGameData(gameId, gameData) {
  games[gameId] = gameData;
  console.log(`Updated game data for game ${gameId}:`, games[gameId]);
}

function createGame(gameId, playerId, deck) {
  const gameData = {
    id: gameId,
    players: [{ id: playerId }], // Сохраняем только id игрока
    started: false,
  };
  updateGameData(gameId, gameData);
  return gameData;
}

function deleteGame(gameId) {
  delete games[gameId];
  console.log(`Deleted game ${gameId}`);
}

async function updatePlayersInFirestore(gameId, players) {
  try {
    await db.collection('Games').doc(gameId).update({ players });
    console.log(`Players updated in Firestore for game ${gameId}:`, players);
  } catch (error) {
    console.error('Error updating players in Firestore:', error);
  }
}

async function deleteGameFromFirestore(gameId) {
  try {
    await db.collection('Games').doc(gameId).delete();
    console.log(`Game ${gameId} deleted from Firestore.`);
  } catch (error) {
    console.error('Error deleting game from Firestore:', error);
  }
}

async function updateGameInFirestore(gameId, gameData) {
  try {
    await db.collection('Games').doc(gameId).update({ started: gameData.started });
    console.log(`Game ${gameId} started status updated in Firestore.`);
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
