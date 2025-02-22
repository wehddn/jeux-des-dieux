const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/', gameController.createGame);
router.get('/', gameController.getGamesList);
router.get("/:id", gameController.getGame);
router.put("/:id/players", gameController.updatePlayersInGame);
router.delete("/:id", gameController.deleteGame);
router.put("/:id/status", gameController.updateGameStatus);

module.exports = router;
