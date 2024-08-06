const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./jeux-des-dieux-firebase-adminsdk-foy72-01cd0d5427.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

const getGame = async (gameId) => {
  if (!gameId) {
    console.error('Error: gameId не определен');
    throw new Error('gameId не определен');
  }

  const gameRef = db.collection('Games').doc(gameId);

  try {
    const gameSnap = await gameRef.get();
    if (gameSnap.exists) {
      return gameSnap.data();
    } else {
      console.log('No such game!');
      return null;
    }
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

const updateGameData = async (gameId, newGameData) => {
  const gameRef = db.collection('Games').doc(gameId);

  try {
    await gameRef.set(newGameData, { merge: true });
  } catch (error) {
    console.error('Error updating game data:', error);
    throw new Error('Error updating game data');
  }
};

const deleteGame = async (gameId) => {
  const gameRef = db.collection('Games').doc(gameId);

  try {
    await gameRef.delete();
    console.log('Game deleted successfully');
  } catch (error) {
    console.error('Error deleting game:', error);
    throw new Error('Error deleting game');
  }
};

const getGamesByFilter = async (field, operator, value) => {
  const gamesRef = db.collection('Games');
  const q = gamesRef.where(field, operator, value);

  try {
    const querySnapshot = await q.get();
    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({ id: doc.id, ...doc.data() });
    });
    return games;
  } catch (error) {
    console.error('Error accessing Firestore:', error);
    throw new Error('Error accessing Firestore');
  }
};

module.exports = { getGame, updateGameData, deleteGame, getGamesByFilter };
