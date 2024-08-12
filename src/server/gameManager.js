const games = {};

function getGame(gameId) {
  return games[gameId];
}

function updateGameData(gameId, gameData) {
  games[gameId] = gameData;
}

function createGame(gameId, playerId, deck) {
  const gameData = {
    id: gameId,
    deck: deck,
    players: [
      { id: playerId, hand: drawInitialCards(deck), table: [], curses: {} }
    ],
    started: false,
  };
  updateGameData(gameId, gameData);
  return gameData;
}

function drawInitialCards(deck) {
  return deck.splice(0, 6);
}

module.exports = {
  getGame,
  updateGameData,
  createGame,
};
