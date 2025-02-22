const {
    getGame,
    updateGameData,
    createGame,
    deleteGame,
    updatePlayersInDB,
    deleteGameFromDB,
  } = require('../model/gameModel');
  const { generateDeck, drawInitialCards } = require('../deck');
  
  let processing = {};
  

  async function joinGame(gameId, userId) {
    let gameData = getGame(gameId);
  
    if (!gameData) {
      gameData = createGame(gameId, userId);
      updateGameData(gameId, gameData);
      await updatePlayersInDB(gameId, gameData.players);
  
      return { status: 'joined', gameData };
    } else {
      const existingPlayer = gameData.players.find(
        (player) => player.id === userId
      );
  
      if (existingPlayer) {
        return { status: 'rejoined', gameData, existingPlayer };
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
          startGame(gameData);
        }
  
        updateGameData(gameId, gameData);
        await updatePlayersInDB(gameId, gameData.players);
  
        return { status: 'joined', gameData };
      } else {
        return { status: 'full' };
      }
    }
  }
  
  async function handleClose(gameId, userId) {
    if (!gameId || !userId) {
      return { status: 'noAction' };
    }
  
    if (processing[gameId]) {
      return { status: 'processing' };
    }
  
    processing[gameId] = true;
  
    const gameData = getGame(gameId);
    if (!gameData) {
      processing[gameId] = false;
      return { status: 'gameNotFound' };
    }
  
    const updatedPlayers = gameData.players.filter(
      (player) => player.id !== userId
    );
  
    if (updatedPlayers.length === 0) {
      deleteGame(gameId);
      await deleteGameFromDB(gameId);
      processing[gameId] = false;
      return { status: 'gameDeleted' };
    } else {
      gameData.players = updatedPlayers;
      gameData.started = false;
  
      updateGameData(gameId, gameData);
      await updatePlayersInDB(gameId, updatedPlayers);
  
      processing[gameId] = false;
      return { status: 'waiting', gameData };
    }
  }
  
  function startGame(gameData) {
    gameData.started = true;
    gameData.deck = generateDeck();
    gameData.discardPile = [];
    gameData.turn = 0;
  
    gameData.players.forEach((player) => {
      player.hand = drawInitialCards(gameData.deck);
      player.table = [];
    });
  
    updateGameData(gameData.id, gameData);
  }
  
  function drawCard(gameId, userId) {
    const gameData = getGame(gameId);
    if (!gameData) return null;
  
    const player = gameData.players.find((p) => p.id === userId);
    if (
      !player ||
      gameData.currentPlayer !== gameData.players.indexOf(player)
    ) {
      return null;
    }
  
    if (gameData.deck.length > 0) {
      const newCard = gameData.deck.pop();
      player.hand.push(newCard);
      gameData.turn += 1;
      updateGameData(gameId, gameData);
      return gameData;
    }
  
    return gameData;
  }
  
  function playCard(gameId, userId, card, slotIndex) {
    const gameData = getGame(gameId);
    if (!gameData) return null;
  
    const player = gameData.players.find((p) => p.id === userId);
    if (
      !player ||
      gameData.currentPlayer !== gameData.players.indexOf(player)
    ) {
      return null;
    }
  
    const slotSuits = [
      'Crèdes',
      'Ordre de la Vérité',
      'Capères',
      'Phagots',
    ];
    const slotSuit = slotSuits[slotIndex];
  
    if (card.suit !== slotSuit && card.suit !== 'Mercenaires') {
      return null;
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
    }
  
    gameData.currentPlayer = (gameData.currentPlayer + 1) % gameData.players.length;
    gameData.turn += 1;
  
    updateGameData(gameId, gameData);
    return gameData;
  }
  
  function playCurseCard(gameId, userId, card, slotIndex, targetPlayerId) {
    const gameData = getGame(gameId);
    if (!gameData) return null;
  
    const player = gameData.players.find((p) => p.id === userId);
    const targetPlayer = gameData.players.find((p) => p.id === targetPlayerId);
  
    if (
      !player ||
      !targetPlayer ||
      gameData.currentPlayer !== gameData.players.indexOf(player)
    ) {
      return null;
    }
  
    const slotSuits = [
      'Crèdes',
      'Ordre de la Vérité',
      'Capères',
      'Phagots',
    ];
    const slotSuit = slotSuits[slotIndex];
  
    const slotHasCards = targetPlayer.table.some(c => c.slot === slotIndex);
    if (!slotHasCards) {
      return null;
    }
  
    if (card.suit !== slotSuit && card.suit !== 'Mercenaires') {
      return null;
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
    }
  
    gameData.currentPlayer = (gameData.currentPlayer + 1) % gameData.players.length;
    gameData.turn += 1;
  
    updateGameData(gameId, gameData);
    return gameData;
  }
  
  function playPurificationCard(gameId, userId, card, slotIndex) {
    const gameData = getGame(gameId);
    if (!gameData) return null;
  
    const player = gameData.players.find((p) => p.id === userId);
  
    if (
      !player ||
      gameData.currentPlayer !== gameData.players.indexOf(player)
    ) {
      return null;
    }
  
    const slotHasCards = player.table.some(c => c.slot === slotIndex);
    if (!slotHasCards) {
      return null;
    }
  
    const slotSuits = [
      'Crèdes',
      'Ordre de la Vérité',
      'Capères',
      'Phagots',
    ];
    const slotSuit = slotSuits[slotIndex];
  
    if (card.suit !== slotSuit && card.suit !== 'Mercenaires') {
      return null;
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
    }
  
    gameData.currentPlayer = (gameData.currentPlayer + 1) % gameData.players.length;
    gameData.turn += 1;
  
    updateGameData(gameId, gameData);
    return gameData;
  }
  
  function discardCard(gameId, userId, card) {
    const gameData = getGame(gameId);
    if (!gameData) return null;
  
    const player = gameData.players.find((p) => p.id === userId);
  
    if (
      !player ||
      gameData.currentPlayer !== gameData.players.indexOf(player)
    ) {
      return null;
    }
  
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
    }
  
    gameData.currentPlayer = (gameData.currentPlayer + 1) % gameData.players.length;
    gameData.turn += 1;
  
    updateGameData(gameId, gameData);
    return gameData;
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
      updateGameData(gameData.id, gameData);
      return true;
    }
  
    return false;
  }
  
  module.exports = {
    joinGame,
    handleClose,
    startGame,
    drawCard,
    playCard,
    playCurseCard,
    playPurificationCard,
    discardCard,
    checkForGameEnd
  };
  